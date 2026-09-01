import type { PageConfigs } from '../page-configs';

export const companyPageConfigs: PageConfigs = {
  companyDashboard: {
    name: 'แดชบอร์ด',
    title: 'ภาพรวมองค์กร',
    description: 'สถิติและภาพรวมการทำงานของบริษัท',
    url: '/company',
  },
  companyEmployee: {
    name: 'รายชื่อพนักงาน',
    title: 'จัดการพนักงาน',
    description: 'รายชื่อพนักงาน สถานะ และสิทธิ์การทำงานในบริษัท',
    url: '/company/employee',
  },
  companyEmployeeNew: {
    name: 'เพิ่มพนักงาน',
    title: 'เพิ่มพนักงานใหม่',
    description: 'เพิ่มพนักงานเข้าสู่องค์กรและมอบหมายบทบาท',
    url: '/company/employee/new',
  },
  companyRole: {
    name: 'จัดการ Role พนักงาน',
    title: 'บทบาทและตำแหน่ง',
    description: 'จัดการบทบาทและสิทธิ์ของพนักงานภายในบริษัท',
    url: '/company/role',
  },
  companySettings: {
    name: 'ข้อมูลบริษัท',
    title: 'ตั้งค่าบริษัท',
    description: 'จัดการข้อมูลพื้นฐานและการตั้งค่าของบริษัท',
    url: '/company/settings',
  },
} as const satisfies PageConfigs;
