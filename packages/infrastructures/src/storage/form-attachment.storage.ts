import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { fileTypeFromBuffer } from 'file-type';
import type { IFormAttachmentStorage } from '@repo/domains/repositories/form';

/** Files are outside the public web root; object keys never come from request paths. */
export class LocalFormAttachmentStorage implements IFormAttachmentStorage {
  constructor(private readonly directory: string) {}

  async identifyMimeType(
    bytes: Uint8Array,
    originalName: string,
  ): Promise<string | null> {
    const type = await fileTypeFromBuffer(bytes).catch(() => undefined);
    if (type) return type.mime;
    if (originalName.toLowerCase().endsWith('.csv')) {
      const text = new TextDecoder('utf-8', { fatal: true });
      const decoded = await Promise.resolve()
        .then(() => text.decode(bytes))
        .catch(() => null);
      if (
        decoded &&
        ![...decoded].some(
          (character) =>
            character.charCodeAt(0) < 32 &&
            ![9, 10, 13].includes(character.charCodeAt(0)),
        )
      )
        return 'text/csv';
    }
    return null;
  }

  private path(key: string) {
    if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(key))
      throw new Error('Invalid attachment storage key');
    return join(this.directory, key);
  }

  async put(companyId: string, bytes: Uint8Array): Promise<string> {
    const key = `${companyId}/${randomUUID()}`;
    const path = this.path(key);
    await mkdir(join(this.directory, companyId), { recursive: true });
    await writeFile(path, bytes, { flag: 'wx' });
    return key;
  }

  async read(key: string): Promise<Uint8Array> {
    return readFile(this.path(key));
  }
  async remove(key: string): Promise<void> {
    await unlink(this.path(key));
  }
}
