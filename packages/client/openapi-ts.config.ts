import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './schema/openapi.yaml',
  output: './src/api',
  plugins: [
    '@hey-api/client-axios',
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@tanstack/react-query',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
  ],
});
