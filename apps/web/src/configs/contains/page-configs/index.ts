export * from './admin-page';
export * from './company-page';

import { adminPageConfigs } from './admin-page';
import { companyPageConfigs } from './company-page';

export type PageConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
};

export type PageConfigs = Record<string, PageConfig>;

export const pageConfigs = {
  ...adminPageConfigs,
  ...companyPageConfigs,
} as const satisfies PageConfigs;

export type PageConfigId = Extract<keyof typeof pageConfigs, string>;
