# Clean Architecture Naming, Linting & Boundary Enforcements

## 1. Zero Tolerance Type & Linting Rules 🛡️

When writing or modifying code in Clean Architecture:
- ❌ **NEVER use `// @ts-ignore`, `// @ts-expect-error`, or `// @ts-nocheck`**: Fix TypeScript errors by writing proper types or interfaces.
- ❌ **NEVER use `// eslint-disable` or `/* eslint-disable */`**: Resolve linting errors by adhering to the established rules.
- ❌ **NO `any` types**: Always define explicit interfaces or use `unknown` if dynamic, then safely narrow down.

---

## 2. Prettier Formatting Configuration (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### `.prettierignore`
```text
node_modules
.next
out
build
dist
coverage
*.log
package-lock.json
pnpm-lock.yaml
bun.lock
bun.lockb
.agents
```

---

## 3. Monorepo Boundary Enforcement (`.dependency-cruiser.cjs`)

```javascript
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // 1. Domain cannot import anything from Application, Infrastructure, Database, or Presentation
    {
      name: 'domain-cannot-import-others',
      comment: 'Domain layer must be independent of other layers (Clean Architecture).',
      severity: 'error',
      from: {
        path: '^packages/domains/src',
      },
      to: {
        path: '^(packages/(applications|infrastructures|database|ui)/src|apps/)',
      },
    },
    // 2. Application cannot import Infrastructure or Presentation
    {
      name: 'application-cannot-import-infrastructure-or-presentation',
      comment: 'Application layer can only depend on Domain, not Infrastructure or UI.',
      severity: 'error',
      from: {
        path: '^packages/applications/src',
      },
      to: {
        path: '^(packages/(infrastructures|database|ui)/src|apps/)',
      },
    },
    // 3. Infrastructure shouldn't import Presentation
    {
      name: 'infrastructure-cannot-import-presentation',
      comment: 'Infrastructure layer should not depend on UI or Apps.',
      severity: 'error',
      from: {
        path: '^packages/(infrastructures|database)/src',
      },
      to: {
        path: '^(packages/ui/src|apps/)',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
```

---

## 3. Single Repository Boundary Enforcement (`.dependency-cruiser.cjs`)

```javascript
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-cannot-depend-on-outer-layers',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { path: '^src/(application|infrastructure|presentation)' },
    },
    {
      name: 'application-cannot-depend-on-infrastructure-or-presentation',
      severity: 'error',
      from: { path: '^src/application' },
      to: { path: '^src/(infrastructure|presentation)' },
    },
    {
      name: 'presentation-cannot-depend-on-infrastructure',
      severity: 'error',
      from: { path: '^src/presentation' },
      to: { path: '^src/infrastructure' },
    },
  ],
};
```
