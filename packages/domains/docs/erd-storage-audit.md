# ERD source-data storage audit — 2026-09-13

> เอกสาร Form รุ่นถัดไป: [Forms workflow design](form-workflow-design.md), [UI flow](form-workflow-ui-flow.md), [development plan](form-workflow-development-plan.md) — Proposed 2026-09-15; ส่วน Form/Owner approval ในเอกสารนี้เป็นแบบก่อนหน้า ส่วน audit โมดูลอื่นยังใช้อ้างอิงได้ canonical DBML ปรับเป็นแบบเสนอใหม่แล้ว ดู [คำอธิบาย ERD ภาษาไทย](erd-description-th.md); runtime ยังไม่ได้ปรับตามข้อเสนอใหม่

สถานะ: **ปรับแบบเสนอเท่านั้น** ตรวจครบ 33 ตาราง ยังไม่เปลี่ยน Drizzle, migration, API, Auth หรือ UI กฎถาวรอยู่ที่ [AGENTS.md](../../../../AGENTS.md)

เก็บข้อมูลต้นทางที่จำเป็นและข้อเท็จจริงซึ่งกู้คืนไม่ได้จากข้อมูลที่เหลือ ค่าที่คำนวณซ้ำได้ให้คำนวณตอนอ่าน ไม่สร้างคอลัมน์ซ้ำ

## ฟิลด์ที่นำออก

| ตาราง                       | ฟิลด์           | แหล่งข้อมูลทดแทน                                                                                                 |
| --------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------- |
| session                     | permissions     | Resolve สิทธิ์จาก active company/member/role/permission และ entitlement ปัจจุบัน; ไม่เก็บ cache ใน DB            |
| attendance_logs             | distance_meters | พิกัดเช็คอินจริง + พิกัดศูนย์กลาง snapshot; server คำนวณและตรวจรัศมีก่อนบันทึก                                   |
| leave_requests              | total_days      | ช่วงวันที่ + unit + ช่วงเวลาที่ขอ + นโยบายนาทีต่อวันสำหรับรายชั่วโมง                                             |
| leave_quotas                | used_days       | รวมคำขอ approved ของสมาชิก/ประเภท/ปี; remaining = quota.total_days - used                                        |
| form_submission             | status          | submitted_at ว่าง = DRAFT; ส่งแล้วไม่มี review = SUBMITTED; review.action = APPROVE/REJECT ให้ APPROVED/REJECTED |
| form_submission             | started_at      | created_at เป็นเวลาเริ่ม draft/รอบแก้ไข ตาม lifecycle นี้                                                        |
| form_submission_contributor | updated_at      | append-only ใช้ created_at; API ที่ต้องการค่าเดิมสามารถ derive ได้                                               |
| submission_review           | updated_at      | append-only ใช้ created_at                                                                                       |

ไม่เพิ่มตารางใหม่ และไม่เปลี่ยน workflow อนุมัติฟอร์ม; state สำหรับ query/API ยังมีสี่ค่าเดิม

## ตรวจครบทุกกลุ่ม

| ตารางที่ตรวจ                                                | ผลและเหตุผลที่เก็บ                                                                                                                                                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| user                                                        | โปรไฟล์/flags เป็นข้อเท็จจริงหรือคำสั่ง; last_login เป็นเวลาเหตุการณ์ ไม่เท่ากับ MAX(session.created_at) เพราะ session หมดอายุ/ถูกลบได้                                                                                  |
| account                                                     | credentials/token/expiry/issuer/scope เป็นข้อมูลจาก provider หรือ auth protocol ไม่ใช่ผลรวมทางธุรกิจ                                                                                                                     |
| session                                                     | นำ permissions ออก; active_company_id คือบริษัทที่เลือก; expiry ไม่อนุมานจาก created_at เพราะยืดอายุได้                                                                                                                  |
| verification, jwks                                          | ข้อมูลยืนยันและกุญแจตาม auth protocol; ไม่เปลี่ยนรูปแบบ public/private key หรือ metadata โดยไม่มีการตรวจ adapter                                                                                                         |
| company, company_branch, company_member                     | ตัวตน สังกัด Role และสถานะที่กำหนด; company_id ที่ซ้ำตามความสัมพันธ์คงไว้เพื่อ tenant boundary                                                                                                                           |
| role, permission, role_permission                           | สิทธิ์ที่กำหนดจริง; role_type กับ is_system_default คนละความหมาย; module กับ feature ไม่จำเป็นต้องตรงกัน                                                                                                                 |
| feature, company_feature, role_feature                      | catalog กับการเปิดสิทธิ์แต่ละระดับเป็นคำสั่งอิสระ; effective access คำนวณตอนอ่าน                                                                                                                                         |
| locations, schedule_slot_location                           | พิกัด/รัศมีเป็นการตั้งค่า; primary/active เป็นการตัดสินใจ ไม่ได้ derive จากลำดับหรือจำนวน assignment                                                                                                                     |
| check_in_schedules, check_in_schedule_roles, schedule_slots | เวลา ลำดับ required/active และ assignments เป็นข้อมูลตั้งต้น; ไม่เพิ่มจำนวน Slot หรือ Role                                                                                                                               |
| attendance_logs                                             | นำระยะออก; คง work_date เพราะลา/ขาดไม่มี checked_in_at และวันทำงานเป็น business date; คง status เป็นผลบันทึก attendance ณ ตอนนั้น รวม manual/excused ซึ่งคำนวณจากเวลาอย่างเดียวไม่ได้และไม่มี historical Slot policy ครบ |
| leave_types                                                 | max_days_per_year เป็นเพดานนโยบาย ไม่ใช่ยอดรวม; unit เป็นค่าเริ่มต้นของประเภท                                                                                                                                            |
| leave_quotas                                                | คง total_days เป็นสิทธิ์ที่กำหนดให้บุคคล/ปี อาจต่างจากเพดานประเภท ไม่ใช่ derived sum; นำ used_days ออก                                                                                                                   |
| leave_requests                                              | นำ total_days ออก; unit เป็นหน่วยของคำขอ ณ ตอนนั้น; status เก็บผลการตัดสินใจ/cancel เพราะไม่มี event/review action แยกที่ให้ derive ได้                                                                                  |
| form_template, form_template_role                           | ชื่อ/การเปิดใช้/สิทธิ์เข้าถึงเป็นข้อมูลต้นทาง                                                                                                                                                                            |
| form_version                                                | version เป็นหมายเลขอ้างอิงถาวร ไม่ใช่ COUNT; status บันทึก publish/archive ซึ่ง published_at อย่างเดียวไม่บอก archive; title/description คือเนื้อหาเวอร์ชันเดิม                                                          |
| form_section, form_field                                    | label/config/type/required/order เป็นนิยาม; form_version_id/company_id คงไว้บังคับ composite FK ไม่ใช่ cache สำหรับแสดงผล                                                                                                |
| form_submission                                             | นำ status/started_at ออก; คง revision เป็น concurrency token ไม่ใช่จำนวน revisions; role/template/version keys บังคับขอบเขตและอ้างอิงชุดคำตอบเดิม                                                                        |
| form_submission_contributor                                 | คงสมาชิกที่เคยมีส่วนร่วม แม้คำตอบถูกแก้ทับแล้วจะ derive จาก answer ปัจจุบันไม่ได้; นำ updated_at ออก                                                                                                                     |
| form_answer                                                 | คำตอบและ updated_by เป็นค่าต้นทาง/ผู้เขียนล่าสุด                                                                                                                                                                         |
| form_answer_attachment                                      | ชื่อไฟล์/type/size เป็น metadata ของไฟล์จริงสำหรับ validation และการอ่านรายการ ไม่ใช่ผลคำนวณทางธุรกิจ; order/actor เป็นข้อมูลที่กำหนด                                                                                    |
| submission_review                                           | action/actor/note/created_at เป็นเหตุการณ์ตัดสินใจต้นทาง; นำ updated_at ออก                                                                                                                                              |

Snapshot ชื่อ/ศูนย์กลาง/รัศมีสถานที่ยังจำเป็นเพราะสถานที่เปลี่ยนได้ ไม่ใช่ผลคำนวณ ส่วน timestamps ของตารางที่แก้ไขได้เก็บเวลาเหตุการณ์จริง ไม่อนุมาน updated_at จาก created_at

## ข้อมูลต้นทางและสูตรการลา

เพิ่ม start_time/end_time สำหรับครึ่งวันและรายชั่วโมง พร้อม minutes_per_day_snapshot เฉพาะรายชั่วโมงซึ่งเป็นนโยบายแปลงหน่วยที่ต้องกำหนดจริง ห้ามสมมติย้อนหลังว่าเป็น 8 ชั่วโมง

แบบเสนอขั้นต่ำนี้ใช้วันที่ตามปฏิทิน Asia/Bangkok (ยังไม่มีปฏิทินวันหยุด/วันทำงานใน ERD):

- day: end_date - start_date + 1; นับรวมต้นและปลาย
- half_day: 0.5 วัน ต้องวันเดียวกันและระบุช่วงเวลาครึ่งวันที่ขอ; server ตรวจช่วงเวลาตามนโยบายครึ่งวัน
- hour: นาทีระหว่าง start_time/end_time หาร minutes_per_day_snapshot; ต้องวันเดียวกันและ end > start
- used_days: รวมเฉพาะ approved ตามสมาชิก/ประเภท โดยแบ่งวันของคำขอเต็มวันที่คร่อมปีเข้าปีที่ถูกต้อง; remaining คำนวณจากสิทธิ์ปีนั้น
- การอนุมัติพร้อมกันต้อง serialize โดย lock แถว quota แล้วคำนวณยอดใหม่ใน transaction; ไม่เปลี่ยนไปใช้ cached counter

หากกติกาจริงไม่นับวันหยุดหรือมีเวลาพัก ต้องเก็บปฏิทิน/ช่วงเวลาต้นทางที่คงประวัติได้ก่อนนำสูตรไปใช้จริง ห้ามใช้วันที่อย่างเดียวแล้วอ้างว่าคำนวณได้ถูกทุกนโยบาย

## ผลต่อการ implement ภายหลัง

- Read model/API อาจยังคืน distance, total/used/remaining และ form status ได้ แต่คำนวณจาก source; ไม่รับผลคำนวณจาก client มา persist
- การตรวจระยะย้ายไป server use case; SQL check คงเฉพาะ snapshot ครบชุด/พิกัดถูกช่วง/มีเหตุการณ์เช็คอิน
- Form submit/review/clone lock submission และใช้ revision; อ่าน derived state ภายใน transaction; review ต้องเกิดหลัง submit และเป็น immutable หนึ่งแถวต่อ submission
- Auth ต้องเปลี่ยน consumer ที่เคยอ่าน session.permissions ก่อนลบคอลัมน์จริง; การปรับนี้ไม่ได้ยืนยันว่า runtime เลิกใช้ cache แล้ว
- ตรวจข้อมูลเดิมก่อน migration โดยเฉพาะจำนวนวันลาแบบกรอกเอง ช่วงเวลารายชั่วโมงที่หาย started_at ที่อาจไม่ตรง created_at และ review/status ที่ไม่ตรงกัน; ห้ามทิ้งค่าที่กู้ต้นทางไม่ได้ ให้หยุด migration และรายงาน
- เอกสาร implementation เก่าของ Schedule/Role เป็นบันทึกระบบที่ใช้งานแล้ว; audit นี้เป็นเป้าหมาย ERD ใหม่เหนือส่วนเก่าที่ต่างกัน

## Form audit รุ่นใหม่ — 2026-09-15

ส่วน Form ในตาราง audit เก่าด้านบนเป็นหลักฐานแบบเดิม ถูกแทนด้วย [ERD ใหม่](../erDiagram.dbml) และ [คำอธิบาย/เหตุผลเก็บข้อมูลรายตาราง](erd-description-th.md) ส่วนโมดูลอื่นไม่ได้เปลี่ยนโครงสร้างในรอบนี้

| รายการ                                 | ผลตรวจแบบเสนอใหม่                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| form_template_role / submission_review | ถอด ACL ตาม template role; ใช้ assignment และแทนผลตรวจเดิมด้วย form_review_entry                                  |
| form_plan/target/period                | เก็บกติกาและประวัติช่วง effective ไม่แก้ inputs หลัง activate; ไม่เก็บ enabled หรือ version mode ซ้ำ              |
| form_occurrence                        | เก็บ version/ขอบเขตเวลาที่เปิดจริงและ key กันซ้ำ; ไม่ copy review/late policy เพราะอ่าน immutable plan config ได้ |
| form_assignment                        | ผู้รับงานจริง Role XOR member; created_at เป็นเวลามอบหมาย ไม่เพิ่ม assigned_at                                    |
| form_submission                        | assignment เป็นขอบเขต revision; ไม่มี role/template ACL ซ้ำ; คง version key เพื่อ integrity                       |
| form_review_entry                      | ผลจริง/เป้าหมาย/comment/actor/history ไม่เก็บ progress หรือ status ซ้ำ                                            |
| Integrity keys                         | company/template/version keys ที่ซ้ำเพื่อ composite FK มีเหตุผลใน ERD description                                 |

ผลนี้เป็น design audit และ DBML validation ไม่ใช่ migration หรือฐานข้อมูลจริง

### Form relational schedule and field review — 2026-09-20

- form_plan_recurring_schedule เก็บ frequency, interval, anchor/end local date, local time, invalid-day policy และ due offset พร้อมหน่วย เป็นกติกาที่ผู้ใช้กำหนด; ไม่มี schedule JSON, weekday/day-of-month ซ้ำ
- form_plan เก็บ late_policy/missed_policy และ effective history; ถอด review_mode ทุกชุดส่งแล้วรอคำตัดสิน
- form_review_entry เก็บผลจริง PASS/NEEDS_CHANGES ต่อ answer พร้อม actor/history; ไม่เก็บ section_id หรือ section status
- form_submission_decision เก็บ APPROVE/RETURN ที่เป็นคำตัดสินจริง หนึ่งครั้งต่อ submission; ไม่ใช่ derived approval cache
- company_id/form_version_id ในตารางลูกเก็บเพื่อ composite FK และ tenant/version integrity
- form_answer.value ยังคง JSONB; ผลรวมและสถานะ Section คำนวณจากผลตรวจล่าสุด
- Drizzle และ initial migration จัดทำแล้ว; ยังไม่ apply DB หรือยืนยัน runtime
