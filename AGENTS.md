# Database design rules

- Store only necessary source facts, explicit business decisions, and historical inputs that cannot be reconstructed reliably.
- Do not persist derived values: sums, counts, balances, durations, distances, percentages, or status/permission caches reproducible from retained source records. Compute them in queries or application read models.
- Before removing a derived field, identify and retain all inputs, units, time boundaries, and historical policy values needed to reproduce it. Never invent missing historical inputs during migration.
- Keep a historical snapshot only when mutable source data cannot reproduce the original fact. Do not use the word snapshot to justify storing a reproducible calculation.
- Keep keys needed for foreign-key integrity/tenant isolation, explicit workflow decisions not otherwise recorded, and concurrency tokens. Document why each apparent duplicate is necessary.
- Do not add persistent derived caches for hypothetical performance needs. Propose a separately documented exception supported by measurements before changing this rule.
- ERD-only changes must be marked proposed when runtime schema differs. Update affected design documents and validate DBML; do not claim a migration or runtime change from a diagram edit.

See `packages/domains/docs/erd-storage-audit.md` for the current table-by-table assessment.
