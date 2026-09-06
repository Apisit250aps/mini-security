import type { PageConfigs } from '../page-configs';

export const companyPageConfigs: PageConfigs = {
  companyDashboard: {
    name: 'ลงเวลาเข้างาน',
    title: 'ลงเวลาเข้างาน',
    description: 'เลือกรอบและบันทึกเวลาเข้างานประจำวัน',
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

  // Attendance Module
  companyAttendanceSchedule: {
    name: 'ตารางเวลาเช็คชื่อ',
    title: 'จัดการตารางเวลาเช็คชื่อ',
    description: 'กำหนดตารางเวลาและรอบการลงเวลาเข้างานตามตำแหน่ง (Role)',
    url: '/company/attendance/schedules',
  },
  companyAttendanceLog: {
    name: 'บันทึกเวลาเข้างาน',
    title: 'ประวัติและบันทึกเวลาเข้างาน',
    description: 'ตรวจสอบประวัติการลงเวลาและบันทึกเวลาการทำงานของพนักงาน',
    url: '/company/attendance/logs',
  },

  // Leave Management Module
  companyLeaveRequest: {
    name: 'คำขอลาหยุดงาน',
    title: 'จัดการคำขอลาหยุดงาน',
    description: 'ตรวจสอบ ยื่น และพิจารณาอนุมัติคำขอลาของพนักงาน',
    url: '/company/leave/requests',
  },
  companyLeaveType: {
    name: 'ประเภทและโควต้าวันลา',
    title: 'ประเภทการลาและโควต้า',
    description: 'กำหนดนโยบายประเภทการลาและโควต้าวันลาประจำปี',
    url: '/company/leave/types',
  },

  companySettings: {
    name: 'ข้อมูลบริษัท',
    title: 'ตั้งค่าบริษัท',
    description: 'จัดการข้อมูลพื้นฐานและการตั้งค่าของบริษัท',
    url: '/company/settings',
  },
} as const satisfies PageConfigs;
