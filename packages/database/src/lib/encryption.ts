import crypto from 'node:crypto';
import { customType } from 'drizzle-orm/pg-core';

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_VERSION = 1;

/**
 * Cache for loaded encryption keys to avoid re-hashing on every call.
 */
const keyCache = new Map<number, Buffer>();
let lookupKeyCache: Buffer | null = null;

/**
 * Derives or resolves a 32-byte Buffer from a string or env variable.
 */
function resolve32ByteKey(rawKey: string): Buffer {
  // Check if 32-byte base64 (approx 44 chars) or base64url
  try {
    const base64Buf = Buffer.from(rawKey, 'base64');
    if (base64Buf.length === 32) return base64Buf;
  } catch {
    // continue to hex check
  }

  // Check if 32-byte hex (64 hex characters)
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  // Otherwise, use SHA-256 to derive a stable 32-byte key
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Returns the current default key version.
 */
export function getCurrentEncryptionVersion(): number {
  const envVersion = Number(process.env.FIELD_ENCRYPTION_CURRENT_VERSION);
  return Number.isFinite(envVersion) && envVersion > 0
    ? envVersion
    : DEFAULT_VERSION;
}

/**
 * Retrieves the encryption key for a given version.
 */
export function getEncryptionKey(
  version: number = getCurrentEncryptionVersion(),
): Buffer {
  const cached = keyCache.get(version);
  if (cached) return cached;

  const versionedEnvName = `FIELD_ENCRYPTION_KEY_V${version}`;
  const envKey =
    process.env[versionedEnvName] ||
    process.env.FIELD_ENCRYPTION_KEY ||
    process.env.BETTER_AUTH_SECRET;

  if (!envKey && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing field encryption key in production: configure ${versionedEnvName}, FIELD_ENCRYPTION_KEY, or BETTER_AUTH_SECRET`,
    );
  }

  const rawKey = envKey || 'dev-fallback-encryption-secret-key-32bytes';
  const key = resolve32ByteKey(rawKey);
  keyCache.set(version, key);
  return key;
}

/**
 * Retrieves the dedicated HMAC lookup key for blind indexing.
 */
export function getLookupKey(): Buffer {
  if (lookupKeyCache) return lookupKeyCache;

  const envKey =
    process.env.FIELD_LOOKUP_KEY ||
    (process.env.BETTER_AUTH_SECRET
      ? `${process.env.BETTER_AUTH_SECRET}:lookup`
      : undefined);

  if (!envKey && process.env.NODE_ENV === 'production') {
    throw new Error(
      'Missing field lookup key in production: configure FIELD_LOOKUP_KEY or BETTER_AUTH_SECRET',
    );
  }

  const rawKey = envKey || 'dev-fallback-lookup-secret-key-32bytes';

  const key = resolve32ByteKey(rawKey);
  lookupKeyCache = key;
  return key;
}

/**
 * Clear the key caches (useful during unit testing or key rotation).
 */
export function resetKeyCache(): void {
  keyCache.clear();
  lookupKeyCache = null;
}

/**
 * Manually register a key for a specific version (useful for testing key rotation).
 */
export function registerEncryptionKey(version: number, key: Buffer): void {
  keyCache.set(version, key);
}

/**
 * Computes an HMAC-SHA256 blind index (hash) for searchable exact-match lookups.
 */
export function blindIndex(
  value: string | null | undefined,
): string | null | undefined {
  if (value === null || value === undefined) return value;
  const key = getLookupKey();
  return crypto.createHmac('sha256', key).update(value).digest('base64url');
}

/**
 * Normalizes email by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Computes the blind index for an email address after normalization.
 */
export function emailLookup(
  email: string | null | undefined,
): string | null | undefined {
  if (email === null || email === undefined) return email;
  return blindIndex(normalizeEmail(email));
}

/**
 * Encrypts a string using probabilistic AES-256-GCM (random 12-byte IV).
 * Output format: `v<version>.<iv_base64url>.<tag_base64url>.<ciphertext_base64url>`
 */
export function encrypt(
  value: string | null | undefined,
  version: number = getCurrentEncryptionVersion(),
): string | null | undefined {
  if (value === null || value === undefined) return value;
  if (value === '') return '';

  const key = getEncryptionKey(version);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    `v${version}`,
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

/**
 * Encrypts a string using deterministic AES-256-GCM (derived IV via HMAC).
 * Yields identical ciphertext for identical plaintext, enabling exact-match queries and unique indexes.
 * Output format: `v<version>.<iv_base64url>.<tag_base64url>.<ciphertext_base64url>`
 */
export function encryptSearchable(
  value: string | null | undefined,
  version: number = getCurrentEncryptionVersion(),
): string | null | undefined {
  if (value === null || value === undefined) return value;
  if (value === '') return '';

  const key = getEncryptionKey(version);
  const lookupKey = getLookupKey();

  // Synthetic/Derived IV tied to value via HMAC
  const iv = crypto
    .createHmac('sha256', lookupKey)
    .update(`searchable:${value}`)
    .digest()
    .subarray(0, 12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    `v${version}`,
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

/**
 * Decrypts an AES-256-GCM envelope payload.
 * If the payload is not in `v<version>.<iv>.<tag>.<ciphertext>` format, returns as-is
 * for seamless backward compatibility with legacy unencrypted data.
 */
export function decrypt(
  payload: string | null | undefined,
): string | null | undefined {
  if (payload === null || payload === undefined) return payload;
  if (typeof payload !== 'string' || payload === '') return payload;

  const parts = payload.split('.');
  if (parts.length !== 4 || !parts[0] || !parts[1] || !parts[2] || !parts[3]) {
    return payload;
  }

  const [versionStr, ivStr, tagStr, dataStr] = parts as [
    string,
    string,
    string,
    string,
  ];
  if (!versionStr.startsWith('v')) return payload;

  const version = Number(versionStr.slice(1));
  if (!Number.isFinite(version) || version <= 0) return payload;

  try {
    const key = getEncryptionKey(version);
    const iv = Buffer.from(ivStr, 'base64url');
    const tag = Buffer.from(tagStr, 'base64url');
    const data = Buffer.from(dataStr, 'base64url');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

    return decrypted.toString('utf8');
  } catch {
    // If decryption fails (e.g. data corrupted or tampered), throw an error for security
    throw new Error(
      'Failed to decrypt authenticated data: authentication tag mismatch or invalid payload',
    );
  }
}

/**
 * Checks if a string has the encrypted envelope format `v<version>.<iv>.<tag>.<ciphertext>`.
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split('.');
  if (parts.length !== 4) return false;
  const first = parts[0];
  return (
    typeof first === 'string' &&
    first.startsWith('v') &&
    parts.every((p) => typeof p === 'string' && p.length > 0)
  );
}

/**
 * Encrypts a number/float as an AES-256-GCM ciphertext string.
 */
export function encryptNumber(
  value: number | null | undefined,
  version: number = getCurrentEncryptionVersion(),
): string | null | undefined {
  if (value === null || value === undefined) return value;
  return encrypt(String(value), version);
}

/**
 * Decrypts an AES-256-GCM ciphertext payload back to a number/float.
 */
export function decryptNumber(
  payload: string | null | undefined,
): number | null | undefined {
  if (payload === null || payload === undefined) return payload;
  const dec = decrypt(payload);
  if (dec === null || dec === undefined || dec === '') {
    return null;
  }
  const parsed = Number(dec);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Drizzle custom column for probabilistic string encryption (random IV).
 * Used for sensitive PII, tokens, and addresses where search is not required.
 */
export const encryptedText = Object.assign(
  customType<{
    data: string;
    driverData: string;
  }>({
    dataType() {
      return 'text';
    },
    toDriver(value: string) {
      if (value === null || value === undefined) return value;
      return encrypt(value) as string;
    },
    fromDriver(value: string) {
      if (value === null || value === undefined) return value;
      return decrypt(value) as string;
    },
  }),
  {
    toDriver: (value: string) => encrypt(value),
    fromDriver: (value: string) => decrypt(value),
  },
);

/**
 * Drizzle custom column for deterministic string encryption (derived IV).
 * Used for exact-match searchable fields like `user.email`.
 */
export const searchableEncryptedText = Object.assign(
  customType<{
    data: string;
    driverData: string;
  }>({
    dataType() {
      return 'text';
    },
    toDriver(value: string) {
      if (value === null || value === undefined) return value;
      return encryptSearchable(value) as string;
    },
    fromDriver(value: string) {
      if (value === null || value === undefined) return value;
      return decrypt(value) as string;
    },
  }),
  {
    toDriver: (value: string) => encryptSearchable(value),
    fromDriver: (value: string) => decrypt(value),
  },
);

/**
 * Drizzle custom column for numbers/floats (e.g., GPS coordinates latitude and longitude).
 * Stores as encrypted text in PostgreSQL, automatically converts to/from `number` in application code.
 */
export const encryptedNumber = Object.assign(
  customType<{
    data: number;
    driverData: string;
  }>({
    dataType() {
      return 'text';
    },
    toDriver(value: number) {
      if (value === null || value === undefined) return value;
      return encryptNumber(value) as string;
    },
    fromDriver(value: string) {
      if (value === null || value === undefined) return value;
      return decryptNumber(value) as number;
    },
  }),
  {
    toDriver: (value: number) => encryptNumber(value),
    fromDriver: (value: string) => decryptNumber(value),
  },
);
