import type { PageConfigs } from '../page-configs';

export const adminPageConfigs: PageConfigs = {
  user: {
    name: 'บัญชีผู้ใช้',
    title: 'บัญชีผู้ใช้',
    description: 'จัดการบัญชีผู้ใช้',
    url: '/admin/user',
  },
  company: {
    name: 'บริษัท',
    title: 'บริษัท',
    description: 'จัดการข้อมูลบริษัท',
    url: '/admin/company',
  },
} as const satisfies PageConfigs;
