# คำอธิบาย ERD ภาษาไทย — Mini Security

สถานะ: **แบบเสนอ (Proposed) ปรับปรุง 2026-09-15** เอกสารนี้อธิบาย [ERD หลักในรูปแบบ DBML](../erDiagram.dbml) โดยส่วน Form เป็นการออกแบบใหม่ ยังไม่ได้เปลี่ยน Drizzle schema, migration, API, UI หรือฐานข้อมูลจริง โมดูลอื่นคงโครงสร้างเดิมในการแก้รอบนี้

เอกสารที่เกี่ยวข้อง: [Feature และ data flow](form-workflow-design.md), [UI และ frontend data flow](form-workflow-ui-flow.md), [แผนพัฒนา](form-workflow-development-plan.md), [การตรวจข้อมูลซ้ำ](erd-storage-audit.md)

## 1. วิธีอ่านแผนภาพ

- Table คือประเภทข้อมูล หนึ่งแถวคือข้อเท็จจริงหรือการตัดสินใจหนึ่งรายการตามขอบเขตของตารางนั้น
- PK คือรหัสแถว เช่น UUIDv7; FK คือการอ้างแถวที่ต้องมีอยู่จริง
- ความสัมพันธ์ `>` ใน DBML หมายถึงหลายแถวฝั่งซ้ายอ้างแถวเดียวฝั่งขวา
- `not null` คือข้อมูลบังคับ `unique` กันค่าซ้ำ และ `checks` จำกัดเงื่อนไขในแถวเดียว
- Composite FK ใช้หลายคอลัมน์ร่วมกัน เช่น `(member_id, company_id)` ทำให้ไม่อ้างสมาชิกของอีกบริษัทได้ แม้ UUID นั้นมีอยู่จริง
- Nullable FK ใช้ระบุความสัมพันธ์ที่มีเฉพาะบางกรณี เช่น `published_by` ยังว่างก่อนเผยแพร่ ต้องมี check ประกอบเมื่อต้องการค่าครบชุด
- `delete: restrict` ป้องกันลบต้นทางที่ประวัติยังอ้างอยู่ ไม่ได้แปลว่าผู้ใช้มีสิทธิ์แก้หรือลบข้อมูล
- Note ภาษาไทยใน DBML อธิบายความหมาย ไม่ใช่กลไกบังคับกติกา กติกาที่ข้ามแถวหรืออ่านสิทธิ์ต้อง implement เพิ่ม

## 2. ภาพรวมทุกโมดูล

| กลุ่ม        | ตาราง                                                                                                | หน้าที่และความสัมพันธ์                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| ตัวตน        | user, account, session, verification, jwks                                                           | บัญชีผู้ใช้ ช่องทางเข้าสู่ระบบ เซสชัน ข้อมูลยืนยัน และกุญแจ JWT ใช้ระบบ Auth เดิม        |
| บริษัท       | company, company_branch, company_member                                                              | company เป็น tenant; สาขาอยู่ใต้บริษัท; member เชื่อม user กับบริษัทและ Role             |
| สิทธิ์       | role, permission, role_permission                                                                    | Role รวมการกระทำที่ได้รับอนุญาต ไม่ใช้ชื่อ Role เป็นกติกาพิเศษของ Form                   |
| ฟีเจอร์      | feature, company_feature, role_feature                                                               | แค็ตตาล็อกฟีเจอร์ การเปิดให้บริษัท และขอบเขตการใช้ของ Role แยกจาก permission รายการกระทำ |
| สถานที่      | locations, schedule_slot_location                                                                    | สถานที่และการอนุญาตพื้นที่เช็คอินต่อ Slot; ปิด assignment ไม่ลบหลักฐานเดิม               |
| เช็คอิน      | check_in_schedules, check_in_schedule_roles, schedule_slots, attendance_logs                         | ตารางเช็คอินผูก Role แบบหลายต่อหลาย Slot ระบุรอบ log ระบุการเช็คจริงต่อสมาชิก/Slot/วัน   |
| การลา        | leave_types, leave_quotas, leave_requests                                                            | ประเภทลา สิทธิ์ที่กำหนดต่อปี และคำขอลาพร้อมเหตุการณ์อนุมัติ ยอดใช้/คงเหลือคำนวณจากต้นทาง |
| นิยาม Form   | form_template, form_version, form_section, form_field                                                | แม่แบบ ฉบับคำถาม หมวด และข้อ                                                             |
| แผนและงาน    | form_plan, form_plan_target, form_plan_period, form_occurrence, form_assignment                      | กติกาเวลา ผู้รับในแผน ช่วงอิสระ รอบที่เปิดจริง และผู้รับจริง                             |
| คำตอบและตรวจ | form_submission, form_submission_contributor, form_answer, form_answer_attachment, form_review_entry | คำตอบแต่ละ revision ผู้มีส่วนร่วม คำตอบรายข้อ หลักฐาน และผลตรวจ                          |

Form เพิ่ม form_plan_recurring_schedule และ form_submission_decision; การเปลี่ยนแปลงรอบนี้มี Drizzle schema และ initial migration แล้ว แต่ยังไม่ apply ฐานข้อมูลและไม่ตรวจ runtime

## 3. ขอบเขต tenant และผู้กระทำ

`user` คือคนเดียวกันระดับระบบ ส่วน `company_member` คือสมาชิกของคนนั้นในบริษัทหนึ่ง ผู้เริ่มกรอก ผู้แก้คำตอบ ผู้ส่ง และผู้ตรวจจึงอ้าง member พร้อม company_id ใช้ user identity เมื่อต้องตรวจ self-review ตลอดสายประวัติ

ตาราง `role` เดิมอนุญาต `company_id = NULL` สำหรับค่าเริ่มต้นระบบ FK role_id จึงยืนยันเพียงว่ามี Role อยู่จริง Use case ต้องตรวจว่าเป็น Role ของ tenant นั้นหรือ system default ที่อนุญาต ห้ามอ้างว่า FK นี้กัน Role ข้าม tenant ได้ทั้งหมด

สิทธิ์ตรวจคำนวณจากสมาชิก active, Role, Permission และขอบเขตข้อมูลปัจจุบัน ไม่มี reviewer_id ในแผน ไม่มี Owner-only condition และไม่เก็บ effective permission ลงตารางงาน การมีสิทธิ์อ่านงานไม่ได้ให้สิทธิ์แก้คำตอบแทนผู้รับงานโดยอัตโนมัติ

## 4. นิยามแบบฟอร์ม

### 4.1 form_template — ตัวตนของแม่แบบ

หนึ่งแถวคือ Form ที่แสดงในตารางรายการ มีบริษัท ชื่อ คำอธิบาย ผู้สร้าง และคำสั่งเปิด/ปิด ใช้ซ้ำได้ผ่านหลายแผน ชื่อในรายการแก้ได้ แต่ชื่อของเอกสารที่เผยแพร่แล้วอยู่ใน version ของตน การปิดหยุดรอบใหม่ ไม่ลบงานเก่า

### 4.2 form_version — ฉบับคำถาม

หนึ่งแถวคือเนื้อหา Form หนึ่งฉบับ `version` เป็นหมายเลขอ้างอิงที่ประกาศ ไม่ใช่จำนวนแถว `status` คือการตัดสินใจ draft/publish/archive จึงเก็บได้ ไม่ใช่สถานะคำตอบที่ derive จาก review

เก็บ title/description ของฉบับนั้น ผู้สร้าง ผู้เผยแพร่ และเวลาประกาศ เมื่อเผยแพร่แล้วห้ามแก้เนื้อหา หมวด ข้อ และ config การแก้ต้อง clone ฉบับใหม่พร้อม ID ของหมวด/ข้อใหม่ ฉบับ archive ยังอ่านและใช้กับงานที่ล็อกไว้ได้ ต้องเพิ่ม partial unique ไม่เกินหนึ่ง draft และหนึ่ง published ต่อแม่แบบใน migration

### 4.3 form_section — หมวดคำถาม

หนึ่งแถวคือหมวดใน version ใช้ title/description/sort_order จัดหน้าและเป็นเป้าหมายตรวจระดับหมวด ไม่เก็บ approved/rejected ในหมวดเพราะหมวดเดียวถูกใช้ในหลายงานและหลายรอบ

### 4.4 form_field — คำถาม

หนึ่งแถวคือคำถามในหมวดและ version เดียวกัน เก็บชนิด label คำแนะนำ required ลำดับ และ config ตามชนิด TEXT/NUMBER/SELECT/BOOLEAN/DATE/IMAGE/FILE

`form_version_id` ที่ดูซ้ำกับ section จำเป็นสำหรับ composite FK ไปยัง answer เพื่อห้ามนำคำถามต่างฉบับมาตอบร่วมกัน SELECT เก็บ option value/label ของฉบับนั้น IMAGE เก็บข้อกำหนดจำนวนภาพ/คำแนะนำใน config ไม่เก็บภาพคำตอบไว้ในนิยามคำถาม

## 5. แผนเวลาและผู้รับงาน

### 5.1 form_plan — กติกาแผนหนึ่งช่วง

หนึ่งแถวคือชุดการตั้งค่าของแผนในช่วงที่กำหนด ไม่ใช่รอบงาน การแก้แผนที่ใช้งานแล้วสร้าง successor ผ่าน `supersedes_plan_id` ซึ่งต้องอยู่ Form และบริษัทเดียวกัน UI รวมเป็นแผนเดียวพร้อมประวัติ ผู้ใช้ไม่ต้องจัดการหลาย config ด้วยตนเอง

| คอลัมน์                          | ความหมาย                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| schedule_kind                    | RECURRING คำนวณซ้ำจากกติกา หรือ EXPLICIT ใช้แถวช่วงเวลา                                       |
| recurring schedule               | แยกตาราง form_plan_recurring_schedule แบบหนึ่งต่อหนึ่ง เก็บ typed inputs                      |
| timezone                         | เขตเวลาที่ใช้ตีความวันที่และเวลาในกติกา                                                       |
| fixed_version_id                 | มีค่าใช้ฉบับนั้น; null ใช้ฉบับล่าสุดตอนเปิดจริง จึงไม่เพิ่ม version_mode ที่บอกเรื่องเดียวกัน |
| late_policy / missed_policy      | คำสั่งอนุญาตส่งช้า และข้าม/เปิดย้อนหลังเมื่อ worker พลาด                                      |
| effective_from / effective_until | ช่วงเปิดใช้แบบรวมต้นไม่รวมท้าย; from ว่างคือยังไม่เปิด; until ว่างคือไม่กำหนดสิ้นสุด          |
| created_by / closed_by           | ผู้สร้าง config และผู้ปิดช่วงเมื่อมีคำสั่งจริง ไม่สมมติว่า worker เป็นสมาชิก                  |
| revision                         | concurrency token ป้องกันการแก้/เปิด/ปิดพร้อมกัน                                              |

ไม่เพิ่ม is_enabled เพราะ derive จากช่วง effective และเวลาปัจจุบันได้ การ pause ปิดช่วงปัจจุบัน resume สร้าง successor หลังช่วงว่าง การตั้งค่าของแถวที่ activate แล้วห้ามแก้ ยกเว้นปิดช่วง effective พร้อม actor เพื่อบันทึกคำสั่งหยุด/เปลี่ยนชุดใหม่

ตัวอย่าง scheduleConfig ใน API (repository แยกลง typed columns; ไม่มี JSON column ใน plan):

```json
{
  "frequency": "MONTHLY",
  "interval": 3,
  "anchorLocalDate": "2026-10-01",
  "openLocalTime": "08:00",
  "endLocalDate": "2027-09-30",
  "invalidDayPolicy": "LAST_DAY",
  "dueOffset": { "amount": 9, "unit": "ELAPSED_HOURS" }
}
```

ตัวอย่างนี้คือรายไตรมาสเริ่มตุลาคม เปิด 08:00 และกำหนดส่งอีก 9 ชั่วโมง ไม่เพิ่ม quarterly table หรือคอลัมน์ duration ของรอบ รอบ explicit ไม่ใช้ object นี้

### 5.2 form_plan_target — กติกาผู้รับในแผน

หนึ่งแถวระบุ Role หรือ member อย่างใดอย่างหนึ่ง Role ต้องมี SHARED/PER_MEMBER ส่วน member ห้ามมี distribution Role เดียวใน config เลือกได้หนึ่งรูปแบบ หากต้องการงานร่วมและงานส่วนตัวให้เลือก direct members เพิ่มหรือใช้แผนแยก

- SHARED เปิดงาน Role หนึ่งงาน คนใน Role ปัจจุบันร่วมตอบชุดเดียว
- PER_MEMBER อ่านสมาชิก active ตอนเปิดจริง สร้างงานส่วนตัวรายคน
- Direct member สร้างงานส่วนตัว สมาชิกซ้ำจากหลายแหล่งรวมเหลือหนึ่งงานส่วนตัวต่อรอบ

หลังแผนเปิดใช้ไม่แก้ target เก่า ต้องสร้าง config ใหม่เพื่อไม่เปลี่ยนคำอธิบายของงานย้อนหลัง

### 5.3 form_plan_period — ช่วงเวลาที่กำหนดเอง

หนึ่งแถวคือเวลาเปิด/กำหนดส่งของงานครั้งหนึ่ง ใช้กับ EXPLICIT เท่านั้น ครอบคลุมครั้งเดียวและหลายช่วงอิสระ บังคับ due > open และไม่ซ้ำคู่เวลาเดิมในแผน ช่วงซ้อนแต่ไม่เหมือนกันอนุญาตโดย UI แจ้งให้ตรวจทาน

## 6. รอบงานและการมอบหมายจริง

### 6.1 form_occurrence — รอบที่เปิดจริง

หนึ่งแถวคือการเปิดใช้แผนหนึ่งครั้ง เก็บ `plan_id` ของ config ที่ใช้จริง `form_version_id` ที่เลือกจริง `opens_at/due_at` และ `occurrence_key` กัน retry ซ้ำ `created_at` คือเวลาที่ worker สร้างจริงจึงแสดงความล่าช้าได้โดยไม่เก็บจำนวนชั่วโมงล่าช้า

`form_template_id` จำเป็นบังคับให้ plan กับ version อยู่ Form เดียวกัน `period_id` ถ้ามีต้องเป็นช่วงของ plan นั้น ใช้ check ใน use case ให้ตรง schedule_kind

**ไม่เก็บ late_policy ซ้ำใน Occurrence** เพราะ config ต้นทางถูกเก็บประวัติและล็อกไว้แล้ว Read model join plan_id ของรอบนั้น ไม่อ่าน successor ล่าสุดเป็นกติกางานเก่า นี่เป็นการลดข้อมูลซ้ำจากร่างก่อนหน้า

เวลาในรอบเก็บเป็นขอบเขตธุรกิจที่เปิดใช้จริง ไม่แก้เมื่อเปลี่ยน calculator หรือกติกาแผน หากออกแบบระบบให้รอบเป็นเพียงผลคำนวณที่ไม่เคยมีการตัดสินใจอิสระ ต้องทบทวนคอลัมน์เหล่านี้ตาม source-only rule ก่อนเพิ่มความสามารถใหม่

ยกเลิกเก็บ cancelled_at/by/reason ครบชุด มี concurrency token ป้องกันยกเลิกชนกับคำสั่งอื่น ผลต่อ assignments คำนวณจาก parent ไม่คัดลอก cancellation ไปทุกแถว

### 6.2 form_assignment — ผู้รับผิดชอบจริง

หนึ่งแถวคือหนึ่งผู้รับงานต่อรอบ มี role_id XOR company_member_id ไม่เก็บ target_type หรือ role_distribution ซ้ำ เวลามอบหมายใช้ created_at ไม่เพิ่ม assigned_at

`form_version_id` เป็น integrity key ส่งต่อจาก occurrence ไป submission เพื่อกัน revision คำตอบใช้คนละฉบับ `assigned_by` ว่างเมื่อ worker เปิดจากแผน มีค่าเมื่อเป็นการมอบหมายด้วยคำสั่งสมาชิกจริง

การเปลี่ยนผู้รับยกเลิกงานเดิมและสร้างงานใหม่ในรอบเดิมด้วย replaces_assignment_id ซึ่ง unique เพื่อไม่แตกสาย replacement ไม่ย้ายคำตอบเดิมให้ผู้รับใหม่ Partial unique ต้องกันผู้รับที่ยังไม่ถูกยกเลิกซ้ำ แต่ปล่อยให้เก็บแถวงานที่ยกเลิกไว้ได้

Replacement ในรอบเดิมใช้ due เดิม ไม่ใช่การต่อเวลา หากเลย due และ late DENY รุ่นแรกต้องสร้างรอบใหม่ที่มีเวลาใหม่แล้วมอบหมาย ไม่อ้างว่า replace assignment เพียงอย่างเดียวต่อเวลาได้

## 7. คำตอบและหลักฐาน

### 7.1 form_submission

หนึ่งแถวคือคำตอบหนึ่ง revision ของ Assignment สาย `supersedes_submission_id` ต้องคง assignment/version/company เดิม และมี successor ได้หนึ่งเดียว root ต่อ assignment ต้องไม่ซ้ำ ผู้เริ่มกับผู้ส่งเป็นคนละข้อเท็จจริง ไม่ใช้ started_by เป็น ACL

`submitted_at` กับ `submitted_by` ต้องมี/ไม่มีพร้อมกัน หลังส่งห้ามแก้เนื้อหา ส่งกลับแล้ว clone เป็น ID ใหม่ `revision` คือ concurrency token ทุก draft/review mutation ไม่ใช่เลขรอบที่แสดงผู้ใช้

### 7.2 form_submission_contributor

หนึ่งแถวต่อสมาชิกที่มีส่วนร่วมใน revision เก็บแม้คำตอบที่เคยแก้ถูกคนอื่นเขียนทับ ใช้ตรวจประวัติผู้มีส่วนร่วมและ self-review permission ไม่ใช่รายการผู้มีสิทธิ์เปิดงาน ไม่มี updated_at เพราะเพิ่มอย่างเดียว

### 7.3 form_answer

หนึ่งแถวต่อ submission/field คำตอบ scalar อยู่ value ส่วนไฟล์อยู่ attachment ค่า false และ 0 เป็นคำตอบจริง NULL ไม่เท่ากับ false

ก่อนส่งให้มี answer row สำหรับทุก field ใน version แม้ optional เว้นว่าง โดย value เป็น NULL เพื่อให้การตรวจราย Field มี answer_id อ้างได้ ไม่แต่งคำตอบให้ผู้ใช้ ข้อนี้ต้อง materialize ใน submit transaction หลัง validate required

Composite FK กัน field ต่าง version และ review ที่อ้าง answer ต่าง submission `updated_by` เก็บผู้แก้ล่าสุดจริงไม่เปลี่ยนเป็นผู้ clone จนกว่าจะมีการแก้

### 7.4 form_answer_attachment

หนึ่งแถวคือไฟล์ที่อ้างจากคำตอบ เก็บ immutable storage_key ชื่อเดิม MIME ขนาด ลำดับ และผู้อัปโหลด ไม่เก็บ signed URL ที่หมดอายุ ไม่เก็บคะแนนความชัดที่ระบบยังไม่มี

Revision ใหม่อ้าง object เก่าได้ เมื่อถ่ายใหม่ให้เปลี่ยน reference ของ revision ใหม่เท่านั้น ภาพเก่ายังดูจากคำตอบเก่าได้ Garbage collection ลบ object เมื่อไม่มี reference และผ่าน retention rule

## 8. ผลตรวจรายคำตอบและคำตัดสินทั้งชุด

form_review_entry เก็บ PASS / NEEDS_CHANGES ที่ answer_id เท่านั้น พร้อม reviewed_by, note และ supersedes_entry_id เพื่อเก็บประวัติ
NEEDS_CHANGES ต้องมีหมายเหตุ และการแก้ผลต้องอ้าง head ของ answer เดิม

Section ไม่มีผลตรวจที่จัดเก็บ: มีข้อที่ต้องแก้แสดงต้องแก้; ทุกข้อ PASS แสดงผ่าน; ที่เหลือรอตรวจ
ปุ่มผ่านทั้ง Section เพิ่ม PASS ให้คำตอบแต่ละข้อใน transaction เดียว พร้อมตรวจ expectedRevision

form_submission_decision เก็บ APPROVE / RETURN เพียงหนึ่งแถวต่อ submission พร้อม decided_by และหมายเหตุ
ทุก submission ที่ส่งแล้วรออนุมัติ ไม่มี review_mode หรือ requires_approval
APPROVE ได้โดยไม่ต้อง PASS ครบ แต่ห้ามมี NEEDS_CHANGES ล่าสุดค้าง
RETURN ต้องมีหมายเหตุ และส่งกลับได้ด้วยเหตุผลภาพรวมแม้ไม่มีข้อที่ทำเครื่องหมาย
หลังคำตัดสินห้ามเพิ่มผลตรวจ; การแก้คำตอบหลัง RETURN สร้าง submission ใหม่และเริ่มผลตรวจใหม่

API review history รวมผลรายคำตอบและคำตัดสินเป็น read model เดียว โดยคำตัดสินมี answerId = null, reviewedBy มาจาก decided_by และ supersedesEntryId = null
การรวมนี้ไม่มีการเก็บข้อมูลซ้ำในฐานข้อมูล

## 9. ข้อมูลซ้ำที่ยอมเก็บและข้อมูลที่ไม่เก็บ

| ข้อมูล                                 | เหตุผล                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| company_id ในตารางลูก                  | บังคับ tenant ด้วย composite FK ไม่ใช่ cache                                         |
| version/template keys บางตาราง         | บังคับ plan/version, assignment/submission, answer/field และ answer/review ให้ตรงกัน |
| plan config ที่ supersede              | ประวัติกติกาที่ใช้จริงและ catch-up ไม่สามารถอาศัย config ล่าสุด                      |
| occurrence version/เวลาจริง            | ขอบเขตงานที่เปิดใช้และห้ามเปลี่ยนตามแผนภายหลัง                                       |
| plan target กับ assignment             | กติกาในอนาคตเทียบกับผู้รับจริงที่ membership อาจเปลี่ยนแล้ว                          |
| contributor                            | ไม่สามารถสร้างรายชื่อคนเคยแก้ครบจาก answer ผู้แก้ล่าสุด                              |
| concurrency tokens                     | ป้องกันเขียนชน ไม่ใช่จำนวนเชิงธุรกิจ                                                 |
| status/progress/overdue/count/next_run | ไม่เก็บ คำนวณจากข้อเท็จจริงและเวลาปัจจุบัน                                           |
| occurrence review/late policy          | ไม่เก็บซ้ำ อ่าน config ประวัติที่รอบอ้าง                                             |
| version_mode/is_enabled/assigned_at    | ไม่เก็บซ้ำ ใช้ fixed_version_id/effective interval/created_at ตามลำดับ               |

## 10. ข้อบังคับที่ต้องเพิ่มใน migration และ use case

DBML นี้มี PK/FK/check/unique พื้นฐาน แต่ยังไม่ใช่ migration ต่อไปนี้เป็น SQL ตัวอย่างสำหรับ partial indexes ที่ต้องนำไปประกอบ migration จริงและตรวจบน PostgreSQL:

```sql
CREATE UNIQUE INDEX form_one_draft_version
ON form_version (form_template_id) WHERE status = 'DRAFT';
CREATE UNIQUE INDEX form_one_published_version
ON form_version (form_template_id) WHERE status = 'PUBLISHED';
CREATE UNIQUE INDEX form_one_root_submission
ON form_submission (assignment_id) WHERE supersedes_submission_id IS NULL;
CREATE UNIQUE INDEX form_active_role_assignment
ON form_assignment (occurrence_id, role_id)
WHERE cancelled_at IS NULL AND role_id IS NOT NULL;
CREATE UNIQUE INDEX form_active_member_assignment
ON form_assignment (occurrence_id, company_member_id)
WHERE cancelled_at IS NULL AND company_member_id IS NOT NULL;
CREATE UNIQUE INDEX form_one_answer_review_root
ON form_review_entry (submission_id, answer_id)
WHERE answer_id IS NOT NULL AND supersedes_entry_id IS NULL;
-- form_submission_decision.submission_id มี UNIQUE constraint
```

Use cases/transactions ต้องบังคับ: active membership/permissions, scope ของ global Role, published version selection, immutable configs/content/entries, เวลาใน config ไม่ทับกันในสายแผน, no cycle, explicit period อยู่ schedule kind ที่ถูกต้อง, review head เป้าหมายเดียวกัน, self-review, finalize once และห้าม APPROVE เมื่อมี NEEDS_CHANGES ล่าสุดค้าง

การเปิดรอบใช้ unique key และ transaction สร้างผู้รับครบหรือ rollback ส่วน cancellation/submit/finalize ต้อง lock ทรัพยากรเกี่ยวข้องในลำดับเดียวกันเพื่อไม่ให้ยกเลิกกับส่งผ่านกันโดยไม่ตรวจสถานะล่าสุด

## 11. ตัวอย่างการไหลของข้อมูล

Form ตรวจพื้นที่ → Version 2 → แผนรายวัน config A → targets Role รปภ. SHARED + สมาชิก ก → รอบ 15 ก.ย. → Assignment สองงาน → สมาชิก ก ส่งภาพใน submission แรก → ผู้มี Permission บันทึก NEEDS_CHANGES รายข้อและ comment → RETURN ทั้งชุด → successor submission เปลี่ยนภาพ → ตรวจและ APPROVE

ถ้าแก้แผนเป็นตรวจทุกสัปดาห์ ให้ปิด effective interval ของ A สร้าง config B อ้าง A รอบเดิมยังอ่าน A และ Version 2 รอบใหม่เลือก Version ตาม B ไม่มีการเปลี่ยนคำตอบหรือกติกางานเก่า

## 12. สถานะการตรวจเอกสาร

DBML ผ่านการ parse/export เป็น PostgreSQL SQL ด้วย @dbml/cli ในรอบเอกสารนี้ การ export ไม่ยืนยันว่า migration ถูกนำไปใช้หรือ runtime ทำงานแล้ว ต้องทำ DB constraint/integration tests ตามแผนพัฒนาก่อนใช้งานจริง

## ช่วงวันที่ของ recurring schedule

anchor_local_date เป็นวันเริ่มช่วงและจุดตั้งต้น; end_local_date รวมวันสุดท้ายตาม timezone (เว้นว่างได้)
frequency และ interval กำหนดจังหวะ ไม่เก็บ weekday/day_of_month ซ้ำ
ช่วง effective ของ plan เก็บประวัติการเปิด/ปิดใช้งาน และกรองรอบซ้ำอีกชั้นหนึ่ง
worker เปิดเฉพาะรอบที่ถึงเวลาแล้ว จึงไม่มีการลบรอบอนาคตล่วงหน้าใน workflow นี้
