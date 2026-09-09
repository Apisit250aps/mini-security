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

  // Form Management Module
  companyFormTemplates: {
    name: 'แบบฟอร์มตรวจสอบ',
    title: 'จัดการแบบฟอร์ม',
    description: 'สร้างและเผยแพร่แบบฟอร์มสำหรับบทบาทต่างๆ',
    url: '/company/forms/templates',
  },
  companyFormCreate: {
    name: 'สร้างแบบฟอร์มใหม่',
    title: 'สร้างแบบฟอร์มใหม่',
    description: 'กำหนดชื่อ คำอธิบาย และบทบาทที่สามารถเข้าถึงแบบฟอร์มนี้ได้',
    url: '/company/forms/templates/create',
  },
  companyFormBuilder: {
    name: 'ออกแบบแบบฟอร์ม',
    title: 'ออกแบบและจัดการฟิลด์แบบฟอร์ม',
    description: 'กำหนดหมวดหมู่คำถาม ฟิลด์ข้อมูล และตรวจสอบตัวอย่างก่อนเผยแพร่',
    url: '/company/forms/templates',
  },
  companyFormSubmissions: {
    name: 'รายการตรวจและคำตอบ',
    title: 'รายการตรวจและผลคำตอบ',
    description: 'ชุดคำตอบแบบฟอร์มตามบทบาทและการอนุมัติ',
    url: '/company/forms/submissions',
  },
  companyFormSubmissionDetail: {
    name: 'บันทึกแบบฟอร์ม',
    title: 'บันทึกแบบฟอร์มตรวจสอบ',
    description: 'กรอกข้อมูลและบันทึกผลการตรวจสอบตามแบบฟอร์ม',
    url: '/company/forms/submissions',
  },

  companySettings: {
    name: 'ข้อมูลบริษัท',
    title: 'ตั้งค่าบริษัท',
    description: 'จัดการข้อมูลพื้นฐานและการตั้งค่าของบริษัท',
    url: '/company/settings',
  },
} as const satisfies PageConfigs;
