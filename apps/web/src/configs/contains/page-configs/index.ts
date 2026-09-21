export * from './admin-page';
export * from './organization-page';
export * from './auth-page';

import { adminPageConfigs } from './admin-page';
import { organizationPageConfigs } from './organization-page';
import { authPageConfigs } from './auth-page';

export type PageConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
};

export type PageConfigs = Record<string, PageConfig>;

export const pageConfigs = {
  ...adminPageConfigs,
  ...organizationPageConfigs,
  ...authPageConfigs,
} as const satisfies PageConfigs;

export type PageConfigId = Extract<keyof typeof pageConfigs, string>;
