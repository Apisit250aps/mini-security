# Use-case authorization

Protected use cases receive `user`, comma-separated `permissions`, and
`activeCompanyId` through `ISecurityContext`. Only trusted server code may build
this context. `userId` can identify a target and is not authentication proof.
Request bodies and query parameters must never supply actor attributes.

`@RequirePermission('resource:action')` rejects missing actors and permissions.
Matching supports exact actions, `resource:*`, and `*`. A wildcard does not grant
access to another company. Extractors select the target company only; they cannot
select the acting user. Missing permissions do not fall back to a database checker.
There is no global permission-checker registration.

The API authentication middleware bypasses the Better Auth cookie cache and
loads current actions for the session's active company once per request. This
adds database reads but makes membership and role-permission changes effective
on the next request. The in-memory session context is refreshed without writing
the session on every request. Company switching writes the new company and its
permissions together. Session refresh must not reset the selected company.
Server-only permission loading for the web app follows the same context contract.

`user.isAdmin === true` grants the existing platform-admin permission override.
Inactive users are rejected before that override. Business-rule exceptions must
still be explicit in each use case: member removal and update allow admins to
manage an OWNER or act without company membership. OWNER identity uses
`roleType`, not a mutable display name. Non-admins require active membership in
the target company, cannot remove an OWNER, change its role, or deactivate it.
Member user/company reassignment and cross-company role/branch assignments remain
invalid for admins too. Branch deletion retains its last-branch and assigned-member
invariants.

For ID-based operations, configure `resolveResource` in the decorator:

```ts
@RequirePermission('company_member:delete', {
  resolveResource: (useCase: RemoveCompanyMemberUseCase, context) =>
    useCase.memberRepository.findById(context.id!),
  notFoundMessage: 'CompanyMember not found',
})
async execute(context: IRemoveCompanyMemberContext, existing?: CompanyMember): Promise<void> {
  // The decorator supplies the authorized resource as the second argument.
  // Membership, OWNER rules and mutation stay in the use case.
}
```

The decorator checks the action before repository access, loads the resource,
checks its stored company, and passes that exact object to the method. The
resource is loaded once per invocation, including for admins. Missing resources
raise `NotFoundError`; caller-provided company IDs cannot override stored scope.
The wrapper supplies the second argument itself and keeps no shared instance
state. Existing domain contracts remain `execute(context)`.

Member update/removal and branch read/update/removal use this pattern. Apply it
when adding or modifying other resource operations; action checks alone are not
a complete audit of object-level authorization across all modules.

The low-level `CheckUserPermissionUseCase` remains available for explicit database
queries. Public sign-in/sign-up flows do not require a permission snapshot.
Direct callers of protected use cases must now supply a trusted actor and snapshot.

Run the authorization regression suite from the repository root:

```sh
npx tsx --test packages/applications/tests/authorization.test.ts
```

References:

- https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- https://better-auth.com/docs/concepts/session-management
