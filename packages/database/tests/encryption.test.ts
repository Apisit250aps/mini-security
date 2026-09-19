import assert from 'node:assert/strict';
import { test } from 'node:test';
import crypto from 'node:crypto';
import {
  encrypt,
  decrypt,
  encryptSearchable,
  blindIndex,
  emailLookup,
  normalizeEmail,
  isEncrypted,
  registerEncryptionKey,
  resetKeyCache,
  encryptedText,
  searchableEncryptedText,
  encryptedNumber,
} from '../src/lib/encryption';

test('Probabilistic encryption (encryptedText) encrypts and decrypts accurately', () => {
  const plaintexts = [
    'super-secret-oauth-token-12345',
    'สมชาย รักชาติ ๑๒๓๔๕',
    '123 Sukhumvit Road, Khlong Toei, Bangkok 10110',
    'https://example.com/avatars/user-99.png',
  ];

  for (const text of plaintexts) {
    const encrypted = encrypt(text);
    assert.ok(encrypted);
    assert.ok(isEncrypted(encrypted));
    assert.notEqual(encrypted, text);

    const decrypted = decrypt(encrypted);
    assert.equal(decrypted, text);
  }
});

test('Probabilistic encryption produces different ciphertexts on identical input (Random IV)', () => {
  const secret = 'identical-secret-value';
  const enc1 = encrypt(secret);
  const enc2 = encrypt(secret);
  const enc3 = encrypt(secret);

  assert.notEqual(enc1, enc2);
  assert.notEqual(enc2, enc3);
  assert.notEqual(enc1, enc3);

  assert.equal(decrypt(enc1), secret);
  assert.equal(decrypt(enc2), secret);
  assert.equal(decrypt(enc3), secret);
});

test('Deterministic encryption (searchableEncryptedText) produces identical ciphertexts for identical inputs', () => {
  const email = 'user@example.com';
  const enc1 = encryptSearchable(email);
  const enc2 = encryptSearchable(email);

  assert.equal(enc1, enc2);
  assert.ok(isEncrypted(enc1));

  const decrypted = decrypt(enc1);
  assert.equal(decrypted, email);

  // Different emails produce different ciphertexts
  const encOther = encryptSearchable('other@example.com');
  assert.notEqual(enc1, encOther);
});

test('Blind index and emailLookup normalize and produce deterministic hash for search/unique constraints', () => {
  const email1 = '  Test.User@Example.COM  ';
  const email2 = 'test.user@example.com';

  assert.equal(normalizeEmail(email1), email2);

  const hash1 = emailLookup(email1);
  const hash2 = emailLookup(email2);

  assert.ok(hash1);
  assert.equal(hash1, hash2);

  const hashOther = emailLookup('different@example.com');
  assert.notEqual(hash1, hashOther);
});

test('encryptedNumber accurately converts floats <-> encrypted text for GPS coordinates', () => {
  const coordinates = [
    13.7563309,
    100.5017651,
    -33.8688197,
    151.2092955,
    0,
    -90,
    90,
  ];

  for (const coord of coordinates) {
    const enc = encryptedNumber.toDriver(coord);
    assert.ok(typeof enc === 'string');
    assert.ok(isEncrypted(enc));

    const dec = encryptedNumber.fromDriver(enc);
    assert.equal(typeof dec, 'number');
    assert.ok(Math.abs(dec - coord) < 1e-7);
  }
});

test('Tamper detection: modifying ciphertext or auth tag throws an error', () => {
  const secret = 'tamper-test-secret';
  const encrypted = encrypt(secret)!;
  const parts = encrypted.split('.');

  // 1. Tamper with ciphertext
  const tamperedData = parts[3]!.slice(0, -2) + 'AA';
  const tamperedPayload1 = [parts[0], parts[1], parts[2], tamperedData].join('.');
  assert.throws(() => decrypt(tamperedPayload1), /Failed to decrypt/);

  // 2. Tamper with authentication tag
  const tamperedTag = parts[2]!.slice(0, -2) + 'BB';
  const tamperedPayload2 = [parts[0], parts[1], tamperedTag, parts[3]].join('.');
  assert.throws(() => decrypt(tamperedPayload2), /Failed to decrypt/);
});

test('Null, undefined, and empty string handling', () => {
  assert.equal(encrypt(null), null);
  assert.equal(encrypt(undefined), undefined);
  assert.equal(encrypt(''), '');

  assert.equal(decrypt(null), null);
  assert.equal(decrypt(undefined), undefined);
  assert.equal(decrypt(''), '');

  assert.equal(blindIndex(null), null);
  assert.equal(blindIndex(undefined), undefined);
  assert.equal(emailLookup(null), null);

  assert.equal(encryptedNumber.toDriver(null as null | number), null);
  assert.equal(encryptedNumber.fromDriver(null as null | string), null);
});

test('Backward compatibility: unencrypted plaintext is returned as-is', () => {
  const legacyStrings = [
    'legacy_plain_email@company.com',
    'regular non-encrypted address string',
    'some-plain-token',
  ];

  for (const legacy of legacyStrings) {
    assert.equal(isEncrypted(legacy), false);
    assert.equal(decrypt(legacy), legacy);
  }
});

test('Key rotation: decrypts v1 payload with v1 key and v2 payload with v2 key', () => {
  try {
    const keyV1 = crypto.randomBytes(32);
    const keyV2 = crypto.randomBytes(32);

    registerEncryptionKey(1, keyV1);
    registerEncryptionKey(2, keyV2);

    const message = 'secret-rotation-message';
    const encV1 = encrypt(message, 1)!;
    const encV2 = encrypt(message, 2)!;

    assert.ok(encV1.startsWith('v1.'));
    assert.ok(encV2.startsWith('v2.'));

    assert.equal(decrypt(encV1), message);
    assert.equal(decrypt(encV2), message);
  } finally {
    resetKeyCache();
  }
});

test('Drizzle column helpers execute toDriver and fromDriver correctly', () => {
  const rawText = 'my-secret-data';
  const driverVal = encryptedText.toDriver(rawText);
  assert.ok(typeof driverVal === 'string');
  assert.ok(isEncrypted(driverVal));

  const readVal = encryptedText.fromDriver(driverVal);
  assert.equal(readVal, rawText);

  const email = 'User@domain.com';
  const driverEmail = searchableEncryptedText.toDriver(email);
  assert.ok(isEncrypted(driverEmail));
  const readEmail = searchableEncryptedText.fromDriver(driverEmail);
  assert.equal(readEmail, email);
});
