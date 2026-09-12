module.exports = {
  apps: [
    {
      name: 'mini-security-api',
      script: 'npm',
      args: 'run start --workspace=api',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        BACKEND_PORT: 8000,
      },
    },
    {
      name: 'mini-security-web',
      script: 'npm',
      args: 'run start --workspace=web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
