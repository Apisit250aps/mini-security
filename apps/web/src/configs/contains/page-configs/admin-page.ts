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
  role: {
    name: 'บทบาท',
    title: 'บทบาทและหน้าที่',
    description: 'จัดการบทบาทผู้ใช้งานและกำหนดระดับสิทธิ์',
    url: '/admin/role',
  },
  permission: {
    name: 'สิทธิ์การใช้งาน',
    title: 'สิทธิ์การใช้งานระบบ',
    description: 'จัดการรายการสิทธิ์และขอบเขตการเข้าถึง',
    url: '/admin/permission',
  },
} as const satisfies PageConfigs;
