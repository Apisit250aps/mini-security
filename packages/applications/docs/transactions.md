# Use case transaction boundaries

Application use cases inject `IUnitOfWork` from domains as the first constructor
argument. Composition provides `UnitOfWork` using the same database instance as
its repositories. All database work inside the callback must be awaited.

| Use cases                                  | Work that must succeed or fail together                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `CreateCompany`                            | Company and initial branch                                                          |
| `AddCompanyMember`                         | Fallback branch creation and membership                                             |
| `CreateUser`, `SignUpEmail`, `SocialLogin` | User, credential/provider account and session where applicable                      |
| `ReviewLeaveRequest`                       | Request status, quota usage and all generated attendance logs                       |
| `CancelLeaveRequest`                       | Quota refund and cancelled status                                                   |
| `CreateFormTemplate`                       | Template and initial draft version                                                  |
| `AssignFormRoles`                          | Delete existing assignments and insert replacements                                 |
| `PublishFormVersion`                       | Read publishing requirements, archive previous version, publish draft               |
| `CreateFormSection`, `CreateFormField`     | Check draft status and insert content in the same transaction snapshot              |
| `StartFormSubmission`                      | Select/create shared draft and record contributor                                   |
| `SaveFormSubmissionDraft`                  | Check revision/status, upsert answers, record contributor, increment revision       |
| `SubmitFormSubmission`                     | Check revision/status and required answers, record contributor, finalize submission |
| `CloneFormSubmission`                      | New draft, copied answers/attachment metadata and contributor lineage               |
| `ReviewFormSubmission`                     | Review eligibility, review record and submission status/revision                    |
| `GetFormTemplate`, `GetFormSubmission`     | Read aggregate details from one consistent snapshot                                 |

Single-statement CRUD and simple list queries do not need an additional use case
transaction. Schedule create/update already persist their aggregate atomically in
the repository; those existing transactions remain and use a savepoint if called
inside a unit of work. Better Auth's own transaction handling is unchanged.

## Database behavior

`AsyncLocalStorage` resolves the current transaction for each repository operation.
Shared repository instances never replace their database connection. The base
repository and standalone form contributor, attachment and review repositories
all resolve this context. Repositories must use the same database instance passed
to `UnitOfWork`; work using another database is outside its atomic boundary.

Top-level transactions use PostgreSQL `SERIALIZABLE`. Conflicting concurrent
read-modify-write operations may fail with SQLSTATE `40001`, including at commit;
they are not retried automatically. Refresh and retry the complete operation after
such a failure. Nested units use savepoints: a caught inner failure rolls back its
own changes, while an outer failure rolls back successful inner work too.

Password hashing runs before opening the transaction. Keep HTTP calls, emails,
file uploads and other external effects outside the callback because database
rollback cannot undo them. This change does not add role grants, form ACL rules,
quota policies or other missing business validation. The existing session-based
permission decorator runs before entering the transaction.

## Verification

Run application tests:

```sh
npx tsx --test packages/applications/tests/*.test.ts
```

Use a disposable PostgreSQL database with the current migrations applied for the
integration test. It checks cross-repository rollback, use case failure, form
revision/contributor rollback, role replacement, async isolation, nested savepoints
and concurrent update conflicts. It removes its fixtures and skips if no test URL
is supplied.

```sh
TEST_DATABASE_URL=postgresql://... npx tsx --test packages/infrastructures/tests/unit-of-work.integration.test.ts
```
