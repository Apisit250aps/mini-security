# Check-in locations — proposed MVP

สถานะ: เอกสารนี้เป็นข้อกำหนดออกแบบเดิม โดย runtime มี schema/API Locations แล้ว และเพิ่มหน้ารวม Locations กับการจัดการใน Slots เมื่อ 2026-09-14 ดูขอบเขตที่ตรวจแล้วใน [location-settings-ui.md](location-settings-ui.md) การเปลี่ยนหน้าจอครั้งนี้ไม่มี migration ใหม่ และไม่ได้ยืนยันว่าทุกข้อเสนอในเอกสารนี้ผ่านการตรวจครบแล้ว การรองรับ Schedule × Role อธิบายใน [check-in-schedule-design.md](check-in-schedule-design.md)

## ขอบเขตและการจัดกลุ่ม

- `locations` อยู่กลุ่ม Location: สถานที่ของสาขา มีพิกัด รัศมีหน่วยเมตร และสถานะเปิดใช้
- `schedule_slot_location` อยู่กลุ่ม Attendance: หนึ่ง Slot อนุญาตหลายสถานที่ และสถานที่ใช้กับหลาย Slot ได้
- สถานที่หลักกำหนดต่อสาขา ไม่เกินหนึ่งแห่ง และต้อง active; อนุญาตให้ยังไม่มีสถานที่หลักได้ เป็นค่าเริ่มต้นสำหรับ UI ไม่ให้สิทธิ์เช็คอินโดยอัตโนมัติ
- อนุญาตสถานที่ต่างสาขาภายในบริษัทเดียวกันเมื่อมี assignment ชัดเจน ไม่บังคับสาขาของสมาชิกให้ตรงกับสถานที่
- ไม่เพิ่ม scheduling workflow หรือเปลี่ยนขอบเขต Form

## ข้อบังคับฐานข้อมูล

1. Composite FK บังคับบริษัทของสถานที่ให้ตรงกับสาขา และบริษัทของ Slot ให้ตรงกับ Schedule
2. ตารางเชื่อมใช้ composite FK ไป Slot และ Location บริษัทเดียวกัน; unique คู่ `(schedule_slot_id, location_id)` รวมคู่ที่ปิดใช้แล้ว เปิดคู่เดิมแทนเพิ่มซ้ำ
3. Attendance ใช้ composite FK ไปสมาชิกและ Slot บริษัทเดียวกัน และอ้างคู่ Slot/Location จริงเมื่อมีหลักฐานพิกัด
4. Latitude อยู่ระหว่าง -90 ถึง 90, longitude -180 ถึง 180; รัศมีเป็นค่าจำกัดมากกว่า 0 ระยะห่างคำนวณจากพิกัดเมื่อใช้งาน ไม่เก็บในตาราง
5. หลักฐานตำแหน่งใน log ต้องครบทั้งชุดหรือเป็น NULL ทั้งชุด; ถ้ามีต้องมีเวลาเช็คอิน สถานะ present/late ส่วนระยะไม่เกินรัศมีตรวจใน use case จากพิกัด ไม่ใช่ stored column/check
6. เปลี่ยน FK สมาชิกใน Attendance เป็น restrict เพื่อรักษาประวัติ; ปิดสมาชิก/สถานที่/assignment แทนลบเมื่อถูกอ้างอิง

DBML ไม่แสดง partial unique index นี้ ต้องเพิ่มใน migration จริง:

```sql
CREATE UNIQUE INDEX locations_one_primary_per_branch
ON locations (company_branch_id)
WHERE is_primary = true;
```

เปลี่ยนสถานที่หลักใน transaction: ปลดแห่งเดิมก่อนตั้งแห่งใหม่; unique index กันคำขอพร้อมกัน การปิดสถานที่หลักต้องตั้ง `is_primary = false` ในการเขียนเดียวกัน

## พฤติกรรมเช็คอิน

- Server ตรวจสมาชิก บริษัท Role Schedule และ assignment เดิม พร้อมตรวจว่า Slot/Location assignment, สถานที่ และสาขายัง active
- เมื่อ Slot มี assignment อย่างน้อยหนึ่งแถว ถือว่าใช้การตรวจพื้นที่ แม้ทุกแถวถูกปิด: หากไม่มีสถานที่ที่ใช้ได้ให้ปฏิเสธ ห้ามถอยไปเช็คอินโดยไม่ตรวจพิกัด
- Slot ที่ไม่มี assignment เลยคงพฤติกรรมเดิมโดยไม่ตรวจพื้นที่ การเปิดกลับต้องใช้คู่เดิม; การจัดการปกติปิด assignment แทนลบ
- ผู้ใช้เลือกสถานที่ที่ได้รับอนุญาตและส่งพิกัด; server อ่านค่าพื้นที่เอง คำนวณระยะบนผิวโลก และยอมรับเมื่อระยะ <= รัศมี ห้ามเชื่อระยะหรือ snapshot จาก client
- บันทึก location ID, ชื่อสถานที่, พิกัดศูนย์กลาง, รัศมี, พิกัดเช็คอินจริง (ไม่เก็บระยะที่คำนวณได้) ใน transaction เดียวกับ log โดยล็อก/ตรวจการแก้ไข configuration พร้อมกัน
- ข้อมูลย้อนหลังอ่าน snapshot ไม่ใช้ค่าปัจจุบันของสถานที่มาคำนวณใหม่ และไม่เขียนทับหลักฐานเดิมเมื่อแก้ชื่อ/พิกัด/รัศมี
- ข้อมูลเดิม, absent/excused และการลงเวลาแทนที่มีสิทธิ์ ให้หลักฐานทั้งชุดเป็น NULL ไม่สร้างพิกัดย้อนหลัง การลงเวลาแทนใช้ `recorded_by` และเหตุผลให้ชัดเจน
- DB ยอมรับ NULL เพื่อรองรับข้อมูลเดิมและ manual; use case ต้องบังคับหลักฐานครบสำหรับการเช็คอินปกติใน Slot ที่ตั้งพื้นที่ไว้ GPS จาก client ไม่ใช่หลักฐานป้องกันการปลอมตำแหน่ง

## ลำดับ migration ในอนาคต

1. เพิ่ม `company_id` แบบ nullable ใน Slots/Logs; backfill จาก Schedule และตรวจให้บริษัทสมาชิกตรงกับ Slot หากไม่ตรงให้หยุดและแก้ข้อมูลก่อน
2. เพิ่ม unique `(id, company_id)` ที่ Branch, Member และ Slot ก่อนสร้าง composite FKs แล้วเปลี่ยน company_id เป็น NOT NULL
3. สร้าง Location และ assignment พร้อม checks, indexes และ partial unique; พิกัดและรัศมีใช้ `double precision`
4. เพิ่ม snapshot columns แบบ nullable ใน log; ปล่อยข้อมูลเก่าเป็น NULL ทั้งชุด เพิ่ม checks และ FKs
5. ติดตั้ง use case/API/UI สำหรับการตรวจพื้นที่ก่อนเปิด assignments จริง และตรวจสิทธิ์ทุกเส้นทางเขียน รวม manual/leave

การตรวจ DBML เป็นเพียงการตรวจแบบ ไม่ยืนยัน migration หรือพฤติกรรมฐานข้อมูลจริง
