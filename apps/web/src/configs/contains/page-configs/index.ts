export * from './admin-page';

import { adminPageConfigs } from './admin-page';
export type PageConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
};

export type PageConfigs = Record<string, PageConfig>;
export const pageConfigs = {
  ...adminPageConfigs,
} as const satisfies PageConfigs;

export type PageConfigId = Extract<keyof typeof pageConfigs, string>;
