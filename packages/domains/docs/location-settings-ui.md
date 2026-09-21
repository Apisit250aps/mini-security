# Locations และการตั้งค่าตำแหน่งใน Slots

เพิ่มเมื่อ 2026-09-14 โดยใช้ตาราง Locations และการผูก Slot ที่มีอยู่ ไม่มี migration ใหม่

- Sidebar กลุ่ม **ข้อมูลบริษัท → Locations** เปิด `/organization/locations` แสดงสถานที่ทั้งหมดของบริษัทที่เลือก รวมสถานที่ปิดใช้ พร้อมสาขา ที่อยู่ พิกัด รัศมีหน่วยเมตร และสถานะหลักของสาขา หน้านี้ใช้ดูข้อมูล
- จัดการผ่าน **ตารางเวลาเช็คชื่อ → จัดการรอบเวลา (Slots) → เมนูของรอบ → ตำแหน่งการเข้างาน** เพิ่ม/แก้ไขข้อมูลสถานที่ และเลือกเปิด/ปิดใช้สถานที่ต่อ Slot ได้ การแก้ข้อมูลสถานที่มีผลกับทุก Slot ที่อ้างถึงสถานที่เดียวกัน
- เปิดคู่ Slot/Location เดิมกลับด้วย assignment ID เดิม ไม่ลบประวัติการผูก หากไม่เคยผูกสถานที่จะเช็คอินโดยไม่ตรวจ GPS; หากเคยผูกแล้วแต่ไม่มีสถานที่ใช้งานได้จะปฏิเสธเช็คอิน
- Query สถานที่สำหรับเช็คอินตรวจสถานะของ assignment, Location และสาขา ตอนกดเช็คอิน Frontend ขอพิกัดปัจจุบันหากมีสถานที่อนุญาต Backend ตรวจรัศมีและเก็บพิกัดกับนโยบายที่ใช้ในขณะเช็คอิน โดยไม่เก็บระยะทางคำนวณ
- ใช้ `location:read` สำหรับดูสถานที่, `location:manage` สำหรับแก้ข้อมูล, `attendance_schedule:read` สำหรับอ่าน assignments และ `attendance_schedule:manage` สำหรับผูก/เปิด/ปิด โดยตรวจบริษัทจากข้อมูล Slot/Location ที่เก็บจริง
- เพิ่ม `GET /locations/slots/{slotId}/assignments` เพื่ออ่าน assignments ทั้งเปิดและปิด และเพิ่ม contract ของ `PUT /locations/slots/{id}` ที่ Backend มีอยู่แล้ว จากนั้น regenerate SDK

## การตรวจสอบ

- Web/API/Application type checks ผ่าน และเทสต์ `packages/applications/tests/location-settings.test.ts` ครอบคลุม 7 กรณีของสิทธิ์บริษัท การเปิดกลับ และ geofence
- ตรวจฐานข้อมูลจริงด้วยข้อมูลทดสอบใน transaction ที่ rollback: เพิ่ม/อ่าน/แก้สถานที่ เปิด/ปิด assignment และกรอง Location/สาขาที่ปิดใช้
- ตรวจ browser ที่ล็อกอินแล้ว: เมนู Locations, หน้ารายการว่างจาก API จริง, หน้า Slots และฟอร์มเพิ่มสถานที่ ไม่ได้บันทึกข้อมูลตัวอย่างค้างในบริษัทของผู้ใช้ และไม่ได้ทดสอบ GPS ของอุปกรณ์จริง
- เทสต์เดิม `attendance-schedules.test.ts` ยังมี 2 failures ที่ยืนยันซ้ำกับโค้ดก่อนการแก้ไข: fixture manual check-in ไม่มี `organizationId` และ mock leave quota ไม่มี `lockByMemberTypeAndYear`
