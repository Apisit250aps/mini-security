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
  companyAttendance: {
    name: 'บันทึกเวลาทำงาน',
    title: 'บันทึกเวลาทำงาน (Attendance)',
    description: 'ตรวจสอบเวลาเข้า-ออกงาน รายงานประจำวัน และการอนุมัติเวลาทำงาน',
    url: '/company/attendance',
  },
  companyAttendanceSchedules: {
    name: 'ตารางงานและกะ',
    title: 'จัดการตารางงานและกะการทำงาน',
    description: 'กำหนดเวลาเริ่ม-เลิกงาน กะทำงาน และมอบหมายกะให้พนักงาน',
    url: '/company/attendance/schedules',
  },
  companyAttendancePolicies: {
    name: 'นโยบาย & จุดเช็ค GPS',
    title: 'นโยบายและจุดเช็คชื่อ (GPS)',
    description:
      'กำหนด Checkpoint และสถานที่รัศมี GPS สำหรับการเช็คชื่อตาม Role',
    url: '/company/attendance/policies',
  },
  companyAttendanceLeave: {
    name: 'การลาและวันหยุด',
    title: 'จัดการคำขอลาและวันหยุด',
    description: 'ตรวจสอบคำขอลาประเภทต่างๆ และดำเนินการอนุมัติการลา',
    url: '/company/attendance/leave',
  },
  companySettings: {
    name: 'ข้อมูลบริษัท',
    title: 'ตั้งค่าบริษัท',
    description: 'จัดการข้อมูลพื้นฐานและการตั้งค่าของบริษัท',
    url: '/company/settings',
  },
} as const satisfies PageConfigs;
