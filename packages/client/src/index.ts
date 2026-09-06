import { client } from './api/client.gen';

client.setConfig({
  throwOnError: true,
});

export * from './api';
export { client };

