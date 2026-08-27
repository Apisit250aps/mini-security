/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domains-must-be-innermost',
      comment: 'packages/domains cannot import from other internal packages',
      severity: 'error',
      from: { path: '^packages/domains' },
      to: { path: '^packages/(database|applications|infrastructures)|^apps' }
    },
    {
      name: 'database-no-app-infra',
      severity: 'error',
      from: { path: '^packages/database' },
      to: { path: '^packages/(applications|infrastructures)|^apps' }
    },
    {
      name: 'applications-no-infra',
      severity: 'error',
      from: { path: '^packages/applications' },
      to: { path: '^packages/infrastructures|^apps' }
    }
  ]
};
