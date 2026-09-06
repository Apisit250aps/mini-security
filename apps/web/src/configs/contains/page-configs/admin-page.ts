import type { PageConfigs } from '../page-configs';

export const adminPageConfigs: PageConfigs = {
  adminDashboard: {
    name: 'แดชบอร์ด',
    title: 'ภาพรวมระบบส่วนกลาง',
    description: 'สถิติภาพรวมและการจัดการระบบความปลอดภัยส่วนกลาง',
    url: '/admin',
  },
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
  adminAttendance: {
    name: 'ระบบลงเวลา',
    title: 'กำกับดูแลระบบลงเวลาเข้างาน',
    description: 'ตรวจสอบข้อมูลตารางเวลาและบันทึกการเข้างานระดับองค์กร',
    url: '/admin/attendance',
  },
  adminLeave: {
    name: 'ระบบการลา',
    title: 'กำกับดูแลระบบจัดการการลา',
    description: 'ตรวจสอบประเภทการลาและคำขอลาหยุดงานระดับองค์กร',
    url: '/admin/leave',
  },
} as const satisfies PageConfigs;
