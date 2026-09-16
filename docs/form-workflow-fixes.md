# Form workflow corrections — 2026-09-16

These are runtime code changes, not a claim that a database migration or deployment has run. Existing source-only tables remain unchanged.

- Mutating a submission or its attachments checks current active membership, authenticated user identity, assignment target, opening time, and assignment/occurrence cancellation. Contributors remain audit records and never grant access.
- Submission/review/attachment reads check persisted tenant scope. Assigned members can read review notes without reviewer permission; reviewers can inspect submissions with `form_review:read`.
- Draft and submit validate values against the submission's immutable field version. SELECT options must be nonempty and unique; numbers, booleans, and ISO dates are validated without coercion. File answers use attachment rows, not URLs in `value`.
- Review writes and finalization run in serializable transactions, require `expectedRevision`, and advance the same submission revision. Supersession must match the current target head. Self-review checks user identity across historical member records. Concurrent transaction conflicts return HTTP 409; clients must refresh and retry. No automatic retry of writes/uploads.
- Review queues exclude `NONE` and cancelled assignments/occurrences. RETURN maps to the UI correction state. Empty sections do not require PASS for ALL_SECTIONS.
- Recurring generation advances from retained occurrences and creates at most 100 rounds per plan per request. CATCH_UP can be called repeatedly; closed configurations retain eligibility only for rounds before their effective end. SKIP opens only the most recent eligible nominal round, omitting older missed rounds. Schedule preview excludes dates before its requested start. Active PER_MEMBER targets deduplicate with direct member targets; empty/inactive recipients fail instead of silently creating empty occurrences.

## Private attachment storage

Multipart `POST /forms/submissions/:id/fields/:fieldId/attachments` takes `file` and `expectedRevision`. It detects MIME from content, enforces 5 MB for images / 10 MB for documents, writes an immutable private object, attaches it, and advances revision. At most 10 attachments per answer. Download through `GET /forms/attachments/:attachmentId` requires authorization; the storage directory is not served publicly. Deletion removes a draft reference only and requires expectedRevision.

`FORM_UPLOAD_DIR` selects the private directory. Local development defaults to `.data/form-attachments` relative to the API working directory. The API image defaults to `/app/data/form-attachments`, backed by the `form-attachments` Compose volume. API/Nginx request caps allow multipart overhead. For multiple API replicas, this directory must be on shared persistent storage or the storage port must be implemented by a shared object store.

Correction drafts retain immutable object references and original uploader metadata. Deleting a draft reference must not remove a historical revision's object. Failed upload transactions remove only the newly created object. Reference-aware retention cleanup is not implemented; do not delete objects merely because one draft reference was removed.

## Verification

70 targeted backend and storage tests passed. Targeted application regression tests cover membership changes, cancellations, typed answers, foreign tenant reads, revisions, scheduler advancement and target deduplication. Attachment tests cover content detection, immutable submissions, stale revision rejection, object cleanup on failed writes and preservation of historical objects.

Web tests and browser verification are intentionally excluded at the user's request. TypeScript and lint cover all workspaces. Unit tests do not establish authenticated live API or multi-session PostgreSQL concurrency behavior.
