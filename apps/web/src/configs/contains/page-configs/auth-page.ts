import type { PageConfigs } from '../page-configs';

export const authPageConfigs: PageConfigs = {
  signIn: {
    name: 'เข้าสู่ระบบ',
    title: 'เข้าสู่ระบบ',
    description: 'เข้าสู่ระบบเพื่อใช้งาน Mini Security',
    url: '/signin',
  },
  signUp: {
    name: 'ลงทะเบียน',
    title: 'สมัครสมาชิก',
    description: 'ลงทะเบียนเข้าใช้งาน Mini Security',
    url: '/signup',
  },
} as const satisfies PageConfigs;
