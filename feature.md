ให้ผมดู schema ปัจจุบันก่อนเพื่อให้ออกแบบต่อเนื่องได้ถูกต้อง

Viewed erDiagram.dbml:1-246

ได้ context ครบแล้ว มาออกแบบ Attendance Module กันเลย

Created attendance_dbml.md

ตอนนี้เพิ่ม schema ลงไปใน erDiagram.dbml เลย

Edited erDiagram.dbml

Schema เขียนลง [erDiagram.dbml](file:///Users/wayuyii/Workspaces/MiniProjects/mini-security/packages/domains/erDiagram.dbml) เรียบร้อยแล้ว นี่คือสรุปและคำอธิบายแต่ละ module:

---

## 🗂️ สรุป Attendance Module — 7 Modules

### Module 1 · `work_schedule` + `work_shift`
**ตารางงาน & กะ**

กำหนดว่าบริษัทมี "ตารางงาน" อะไรบ้าง (เช่น ตารางงาน Office, ตารางงาน โรงงาน) แต่ละตารางมีได้หลาย **กะ** (shift) เช่น กะเช้า `08:00–17:00`, กะดึก `22:00–06:00` (รองรับ `is_overnight`). สี `color` ใช้แสดงบน Calendar UI

---

### Module 2 · `attendance_policy` + `attendance_checkpoint` + `role_attendance_policy`
**กำหนด Dynamic Checkpoint ต่อ Role**

นี่คือหัวใจของ Dynamic Role-based Check-in:

| Role | Policy | Checkpoints |
|------|--------|-------------|
| `OWNER` | นโยบาย Owner | CHECK_IN (เช้า) |
| `MANAGER` | นโยบาย Manager | CHECK_IN, CHECK_OUT |
| `MEMBER` | นโยบาย พนักงานทั่วไป | CHECK_IN (เช้า), BREAK_OUT (พัก), BREAK_IN (กลับพัก), CHECK_OUT (เย็น) |

แต่ละ checkpoint กำหนดได้ว่า: เปิดช่วงเวลาไหน (`window_start/end`), ผ่อนผันกี่นาที (`grace_minutes`), บังคับถ่ายรูป (`require_photo`), บังคับ GPS (`require_location`)

---

### Module 3 · `attendance_location` + `checkpoint_location`
**สถานที่และรัศมี GPS**

กำหนด location ที่อนุญาตให้เช็คได้ รองรับ 3 แบบ:
- `RADIUS` — พิกัด GPS + รัศมี (เมตร)
- `FIXED` — สถานที่คงที่
- `BRANCH` — อ้างอิงจาก `company_branch`

1 checkpoint สามารถผูกได้หลาย location (เช่น สาขา A หรือ สาขา B ก็เช็คได้)

---

### Module 4 · `member_work_schedule`
**กำหนดกะให้ Member**

บอกว่าพนักงานคนนี้ใช้กะไหนตั้งแต่วันที่เท่าไหร่ รองรับ **การเปลี่ยนกะในอนาคต** (มี `effective_date` + `end_date`) ไม่ต้อง hardcode

---

### Module 5 · `attendance_record`
**บันทึกรายวัน (Header)**

1 row = 1 พนักงาน / 1 วัน รวม summary: `total_work_minutes`, `overtime_minutes`, `late_minutes` เพื่อส่งต่อให้ **Payroll Module** คำนวณเงินเดือนได้ทันที มี `approved_by` สำหรับ manager อนุมัติ

---

### Module 6 · `attendance_log`
**บันทึก Event ทุกครั้งที่เช็ค**

1 row = 1 ครั้งที่กด check ใน checkpoint นั้น บันทึกครบ:
- พิกัด GPS จริง + ความแม่นยำ
- รูปถ่าย URL
- Device ID, IP address
- `is_manual` — สำหรับ admin เช็คแทน พร้อม `manual_reason`

---

### Module 7 · `leave_request`
**การลา**

บันทึกคำขอลาทุกประเภท (ป่วย, พักร้อน, ลากิจ, ลาคลอด) รองรับ **ครึ่งวัน** (`total_days = decimal`), แนบเอกสาร `attachment_url` และมีสถานะ approval flow พร้อมรองรับการดึงข้อมูลไปคำนวณเงินเดือนในอนาคต

---

> **Payroll Module (อนาคต)** สามารถดึงข้อมูลจาก `attendance_record.total_work_minutes`, `overtime_minutes`, `late_minutes` + `leave_request` ที่ approved ได้ครบเลย โดยไม่ต้องคำนวณซ้ำ

**ใช่ครับ เปลี่ยนได้ตลอด** — ตารางนั้นแค่เป็นตัวอย่างว่า "ถ้าจะ config แบบนั้น ทำได้" แต่ระบบไม่ได้ hardcode อะไรเลย

---

## ทำไมถึงเปลี่ยนได้?

เพราะ relationship ทั้งหมดเก็บใน **database ล้วนๆ** ไม่มีอะไรอยู่ใน code:

```
role ──→ role_attendance_policy ──→ attendance_policy
                                         └─ attendance_checkpoint (1..N)
                                               └─ checkpoint_location (1..N)
```

**ทุกอย่าง CRUD ได้หมด:**

| สิ่งที่ทำได้ | วิธี |
|---|---|
| เพิ่ม/ลด checkpoint ใน policy | INSERT / DELETE `attendance_checkpoint` |
| สลับ policy ให้ role | UPDATE `role_attendance_policy` |
| Role เดียวมีได้หลาย policy | INSERT หลาย row ใน `role_attendance_policy` |
| Policy เดียวใช้ได้กับหลาย role | INSERT หลาย row ใน `role_attendance_policy` |
| สร้าง policy ใหม่ให้บริษัทอื่น | ขึ้นอยู่กับ `company_id` ใน `attendance_policy` |
| เปลี่ยนเวลา window, grace period | UPDATE `attendance_checkpoint` |

---

## ตัวอย่าง scenario ที่ทำได้

```
บริษัท A:
  MANAGER → Policy "ผู้จัดการ" → [CHECK_IN, CHECK_OUT]

บริษัท B (ต่างบริษัท ต่าง config):
  MANAGER → Policy "Manager สายการผลิต" → [CHECK_IN, BREAK_OUT, BREAK_IN, CHECK_OUT]

บริษัท A (เดือนหน้าเปลี่ยน policy):
  MANAGER → Policy "ผู้จัดการ v2" → [CHECK_IN, CHECK_OUT, LOCATION_REPORT]
  ↑ แค่ update role_attendance_policy ให้ชี้ไป policy ใหม่
```

---

## ข้อควรระวังอย่างเดียว

ถ้า **เปลี่ยน policy หลังจากมีข้อมูลเก็บแล้ว** (`attendance_log` เก่า) — log เก่ายัง reference `checkpoint_id` เดิมอยู่ ซึ่งดีเพราะ **ประวัติไม่หาย** แค่ policy ปัจจุบันเปลี่ยน ไม่กระทบ historical data ✅