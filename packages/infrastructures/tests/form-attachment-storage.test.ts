import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalFormAttachmentStorage } from '../src/storage/form-attachment.storage';

test('private storage round trip uses generated keys and detects content independently of filename', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'form-storage-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const storage = new LocalFormAttachmentStorage(directory);
  const bytes = new TextEncoder().encode('%PDF-1.7\nexample file\n%%EOF');
  assert.equal(
    await storage.identifyMimeType(bytes, 'fake.jpg'),
    'application/pdf',
  );
  assert.equal(
    await storage.identifyMimeType(
      new TextEncoder().encode('<script>bad</script>'),
      'fake.png',
    ),
    null,
  );
  const key = await storage.put('00000000-0000-4000-8000-000000000001', bytes);
  assert.deepEqual(await storage.read(key), Buffer.from(bytes));
  await assert.rejects(
    storage.read('../secret'),
    /Invalid attachment storage key/,
  );
  await storage.remove(key);
  await assert.rejects(storage.read(key), /ENOENT/);
});
