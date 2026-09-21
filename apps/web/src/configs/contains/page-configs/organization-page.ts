import type { PageConfigs } from '../page-configs';

export const organizationPageConfigs: PageConfigs = {
  organizationDashboard: {
    name: 'ลงเวลาเข้างาน',
    title: 'ลงเวลาเข้างาน',
    description: 'เลือกรอบและบันทึกเวลาเข้างานประจำวัน',
    url: '/organization',
  },
  organizationEmployee: {
    name: 'รายชื่อพนักงาน',
    title: 'จัดการพนักงาน',
    description: 'รายชื่อพนักงาน สถานะ และสิทธิ์การทำงานในองค์กร',
    url: '/organization/employee',
  },
  organizationEmployeeNew: {
    name: 'เพิ่มพนักงาน',
    title: 'เพิ่มพนักงานใหม่',
    description: 'เพิ่มพนักงานเข้าสู่องค์กรและมอบหมายบทบาท',
    url: '/organization/employee/new',
  },
  organizationRole: {
    name: 'จัดการ Role พนักงาน',
    title: 'บทบาทและตำแหน่ง',
    description: 'จัดการบทบาทและสิทธิ์ของพนักงานภายในองค์กร',
    url: '/organization/role',
  },
  organizationRoleNew: {
    name: 'เพิ่มบทบาทใหม่',
    title: 'สร้างบทบาทใหม่',
    description: 'กำหนดบทบาทและตำแหน่งพนักงานสำหรับองค์กรนี้',
    url: '/organization/role/new',
  },
  organizationRoleDetail: {
    name: 'รายละเอียดบทบาท',
    title: 'จัดการบทบาทและสิทธิ์',
    description: 'กำหนดสิทธิ์การเข้าถึงและการดูแลฟีเจอร์สำหรับบทบาทนี้',
    url: '/organization/role',
  },

  // Attendance Module
  organizationAttendanceSchedule: {
    name: 'ตารางเวลาเช็คชื่อ',
    title: 'จัดการตารางเวลาเช็คชื่อ',
    description: 'กำหนดตารางเวลาและรอบการลงเวลาเข้างานตามตำแหน่ง (Role)',
    url: '/organization/attendance/schedules',
  },
  organizationAttendanceScheduleDetail: {
    name: 'จัดการรอบเวลาของตาราง',
    title: 'จัดการรอบเวลาและเงื่อนไข',
    description: 'กำหนดรอบเวลา (Slots) สถานที่ และเงื่อนไขการลงเวลา',
    url: '/organization/attendance/schedules',
  },
  organizationAttendanceLog: {
    name: 'บันทึกเวลาเข้างาน',
    title: 'ประวัติและบันทึกเวลาเข้างาน',
    description: 'ตรวจสอบประวัติการลงเวลาและบันทึกเวลาการทำงานของพนักงาน',
    url: '/organization/attendance/logs',
  },

  // Leave Management Module
  organizationLeaveRequest: {
    name: 'คำขอลาหยุดงาน',
    title: 'จัดการคำขอลาหยุดงาน',
    description: 'ตรวจสอบ ยื่น และพิจารณาอนุมัติคำขอลาของพนักงาน',
    url: '/organization/leave/requests',
  },
  organizationLeaveRequestNew: {
    name: 'ยื่นคำขอลาใหม่',
    title: 'ยื่นคำขอลาหยุดงาน',
    description: 'กรอกแบบฟอร์มเพื่อขอลางานและตรวจสอบโควต้าคงเหลือ',
    url: '/organization/leave/requests/new',
  },
  organizationLeaveType: {
    name: 'ประเภทและโควต้าวันลา',
    title: 'ประเภทการลาและโควต้า',
    description: 'กำหนดนโยบายประเภทการลาและโควต้าวันลาประจำปี',
    url: '/organization/leave/types',
  },

  // Form Management Module
  organizationFormPlans: {
    name: 'แผนการตรวจ',
    title: 'แผนการตรวจและรอบงาน',
    description:
      'กำหนดตารางเวลา มอบหมายผู้ตรวจ และบริหารจัดการรอบการตรวจประเมิน',
    url: '/organization/forms/plans',
  },
  organizationFormPlanCreate: {
    name: 'สร้างแผนการตรวจ',
    title: 'สร้างแผนการตรวจใหม่',
    description: 'ตั้งค่ากำหนดการ มอบหมายงาน และกำหนดนโยบายการตรวจรับ',
    url: '/organization/forms/plans/new',
  },
  organizationFormPlanDetail: {
    name: 'รายละเอียดแผนการตรวจ',
    title: 'รายละเอียดแผนการตรวจ',
    description: 'ภาพรวมแผนงาน กำหนดการ และประวัติรอบงานที่เปิด',
    url: '/organization/forms/plans',
  },
  organizationFormTasks: {
    name: 'งานตรวจของฉัน',
    title: 'งานตรวจของฉัน',
    description: 'รายการงานตรวจที่ได้รับมอบหมายตามรอบการตรวจที่เปิดอยู่',
    url: '/organization/forms/tasks',
  },
  organizationFormTemplates: {
    name: 'แม่แบบฟอร์ม',
    title: 'จัดการแม่แบบฟอร์ม',
    description: 'สร้างและเผยแพร่แบบฟอร์มสำหรับบทบาทต่างๆ',
    url: '/organization/forms/templates',
  },
  organizationFormReviewQueue: {
    name: 'คิวตรวจแบบฟอร์ม',
    title: 'คิวตรวจ',
    description: 'รายการแบบฟอร์มที่รอการตรวจอนุมัติ',
    url: '/organization/forms/reviews',
  },
  organizationFormReview: {
    name: 'ตรวจแบบฟอร์ม',
    title: 'ตรวจแบบฟอร์ม',
    description: 'ตรวจสอบคำตอบและพิจารณาอนุมัติหรือส่งกลับแก้ไข',
    url: '/organization/forms/reviews',
  },
  organizationFormCreate: {
    name: 'สร้างแบบฟอร์มใหม่',
    title: 'สร้างแบบฟอร์มใหม่',
    description: 'กำหนดชื่อ คำอธิบาย และบทบาทที่สามารถเข้าถึงแบบฟอร์มนี้ได้',
    url: '/organization/forms/templates/create',
  },
  organizationFormBuilder: {
    name: 'ออกแบบแบบฟอร์ม',
    title: 'ออกแบบและจัดการฟิลด์แบบฟอร์ม',
    description: 'กำหนดหมวดหมู่คำถาม ฟิลด์ข้อมูล และตรวจสอบตัวอย่างก่อนเผยแพร่',
    url: '/organization/forms/templates',
  },
  organizationFormSubmissions: {
    name: 'ประวัติและผลการตรวจ',
    title: 'ประวัติและผลการตรวจ',
    description: 'ประวัติผลการตรวจที่เคยส่งแล้วและการพิจารณาอนุมัติ',
    url: '/organization/forms/submissions',
  },
  organizationFormSubmissionDetail: {
    name: 'บันทึกแบบฟอร์ม',
    title: 'บันทึกแบบฟอร์มตรวจสอบ',
    description: 'กรอกข้อมูลและบันทึกผลการตรวจสอบตามแบบฟอร์ม',
    url: '/organization/forms/submissions',
  },

  organizationLocations: {
    name: 'Locations',
    title: 'สถานที่ขององค์กร',
    description:
      'สถานที่ทั้งหมดขององค์กร พร้อมสาขา/ไซต์ พิกัด รัศมี และสถานะการใช้งาน',
    url: '/organization/locations',
  },
  organizationSettings: {
    name: 'ข้อมูลองค์กร',
    title: 'ตั้งค่าองค์กร',
    description: 'จัดการข้อมูลพื้นฐานและการตั้งค่าขององค์กร',
    url: '/organization/settings',
  },
} as const satisfies PageConfigs;
