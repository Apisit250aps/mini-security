# 📦 Database Schema Documentation

> **Mini-Security** — อธิบายความหมายและหน้าที่ของแต่ละตารางในระบบ  
> อ้างอิงจาก [`erDiagram.dbml`](../erDiagram.dbml)
>
> **แบบเสนอ MVP ปรับเมื่อ 2026-09-09:** DBML เพิ่ม 10 ตารางสำหรับสร้าง/เผยแพร่ฟอร์มตาม Role สมาชิก Role เดียวกันร่วมกรอกชุดคำตอบ และ Owner อนุมัติทั้งชุด ยังไม่ได้ implement ใน Drizzle; ระบบแผน/รอบ/งานตรวจเลื่อนออก ดู [Form MVP Design](inspection-form-design.md) ส่วนหัวข้อ 1–7 ด้านล่างอธิบายโมดูลเดิม

---

## สารบัญ

1. [Auth Management](#1-auth-management)
2. [Organization & RBAC](#2-organization--rbac)
3. [Feature Management](#3-feature-management)
4. [Attendance Module (ระบบเช็คชื่อเข้างาน)](#4-attendance-module-ระบบเช็คชื่อเข้างาน)
5. [Leave Management Module (ระบบขอลา)](#5-leave-management-module-ระบบขอลา)
6. [ความสัมพันธ์ระหว่างโมดูลและการทำงาน (Cross-Module Integration & Workflows)](#6-ความสัมพันธ์ระหว่างโมดูลและการทำงาน-cross-module-integration--workflows)
7. [สรุปตารางทั้งหมดและ Entity-Relationship Architecture](#7-สรุปตารางทั้งหมดและ-entity-relationship-architecture)

---

## 1. Auth Management

กลุ่มตารางที่ดูแลระบบ **Authentication & Identity** ทั้งหมด ใช้ร่วมกับ **Better Auth**

### 1.1 `user`

| Column           | Type      | คำอธิบาย                                      |
| ---------------- | --------- | --------------------------------------------- |
| `id`             | uuid (PK) | UUIDv7 Primary Key                            |
| `name`           | text      | ชื่อแสดงผลของผู้ใช้                           |
| `email`          | text      | อีเมล — ต้อง unique ทั้งระบบ                  |
| `email_verified` | boolean   | ยืนยันอีเมลแล้วหรือยัง                        |
| `image`          | text      | URL รูปโปรไฟล์                                |
| `is_admin`       | boolean   | เป็น Super Admin ระดับ Platform หรือไม่       |
| `is_active`      | boolean   | บัญชีนี้ยังใช้งานได้อยู่หรือไม่ (soft delete) |
| `last_login`     | timestamp | วันเวลาที่ login ล่าสุด                       |

**หน้าที่:** เป็น **Identity Master** ของทั้งระบบ ทุก entity ที่เป็น "คน" อ้างอิงกลับมาที่ตารางนี้  
ตาราง `user` ไม่มีข้อมูล credential — รหัสผ่านและ OAuth token เก็บแยกใน `account`

---

### 1.2 `account`

| Column                    | Type      | คำอธิบาย                                            |
| ------------------------- | --------- | --------------------------------------------------- |
| `id`                      | uuid (PK) | UUIDv7 Primary Key                                  |
| `user_id`                 | uuid (FK) | อ้างอิงไปยัง `user.id`                              |
| `account_id`              | text      | ID ของบัญชีจาก Provider (เช่น Google UID)           |
| `provider_id`             | text      | ชื่อ Provider เช่น `google`, `github`, `credential` |
| `access_token`            | text      | OAuth Access Token (encrypted)                      |
| `refresh_token`           | text      | OAuth Refresh Token (encrypted)                     |
| `id_token`                | text      | OpenID Connect ID Token                             |
| `access_token_expires_at` | timestamp | วันหมดอายุ Access Token                             |
| `password`                | text      | รหัสผ่านแบบ hashed (กรณีใช้ email/password)         |

**หน้าที่:** เก็บ **วิธีการ login** ของแต่ละ user  
1 user มีหลาย account ได้ (เช่น login ด้วย Google + GitHub + Email/Password พร้อมกัน)  
Composite index `(provider_id, account_id)` ทำให้ค้นหาว่า OAuth callback นี้เป็น user ไหนได้เร็ว

---

### 1.3 `session`

| Column              | Type      | คำอธิบาย                                          |
| ------------------- | --------- | ------------------------------------------------- |
| `id`                | uuid (PK) | UUIDv7 Primary Key                                |
| `user_id`           | uuid (FK) | อ้างอิงไปยัง `user.id`                            |
| `token`             | text      | Session Token — ส่งผ่าน Cookie/Header ทุก request |
| `expires_at`        | timestamp | วันหมดอายุ session                                |
| `ip_address`        | text      | IP ที่ใช้สร้าง session                            |
| `user_agent`        | text      | Browser/Device ที่ใช้                             |
| `active_company_id` | uuid (FK) | บริษัทที่ user กำลัง "Active" อยู่ในขณะนี้        |

**หน้าที่:** เก็บ **session ที่ active** ของ user  
`active_company_id` คือ **Tenant Context** — บอกระบบว่า request นี้ทำงานในนามบริษัทไหน  
เมื่อ user logout หรือ token หมดอายุ → row นี้จะถูกลบออก

Drizzle ปัจจุบันยังมี `permissions` (nullable text) สำหรับ permission snapshot ของ active company ซึ่งต้องใช้ร่วมกับการตรวจ resource scope ส่วนเส้น `session.active_company_id → company.id` ใน DBML เป็นความสัมพันธ์เชิงออกแบบ ยังไม่มี `.references()` ใน Drizzle ปัจจุบัน

---

### 1.4 `verification`

| Column       | Type      | คำอธิบาย                         |
| ------------ | --------- | -------------------------------- |
| `id`         | uuid (PK) | UUIDv7 Primary Key               |
| `identifier` | text      | ตัวระบุ เช่น email หรือ user ID  |
| `value`      | text      | Token หรือ OTP ที่ต้องนำไปยืนยัน |
| `expires_at` | timestamp | หมดอายุเมื่อไหร่                 |

**หน้าที่:** Temporary store สำหรับ **OTP / Email Verification Link / Password Reset Token**  
Better Auth ใช้ตารางนี้เพื่อ:

- ยืนยัน email แรกเข้า
- ส่ง link reset password
- ส่ง OTP 2FA

เมื่อ verify สำเร็จหรือ token หมดอายุ → row จะถูกลบออกอัตโนมัติ

---

### 1.5 `jwks`

| Column        | Type      | คำอธิบาย                                |
| ------------- | --------- | --------------------------------------- |
| `id`          | uuid (PK) | UUIDv7 Primary Key                      |
| `public_key`  | text      | Public Key สำหรับ verify JWT            |
| `private_key` | text      | Private Key สำหรับ sign JWT (encrypted) |
| `alg`         | text      | Algorithm เช่น `RS256`, `ES256`         |
| `crv`         | text      | Curve สำหรับ EC keys เช่น `P-256`       |
| `expires_at`  | timestamp | วันหมดอายุของ key pair                  |

**หน้าที่:** เก็บ **JSON Web Key Set (JWKS)** ใช้สำหรับ sign และ verify JWT Token  
รองรับ key rotation — เมื่อ key หมดอายุ Better Auth จะสร้าง key pair ใหม่

---

## 2. Organization & RBAC

กลุ่มตารางที่ดูแล **Multi-Tenant Organization** และ **Role-Based Access Control**

### 2.1 `company`

| Column      | Type      | คำอธิบาย                               |
| ----------- | --------- | -------------------------------------- |
| `id`        | uuid (PK) | UUIDv7 Primary Key                     |
| `name`      | text      | ชื่อบริษัท                             |
| `slug`      | text      | URL slug — unique ทั้งระบบ เช่น `acme` |
| `logo`      | text      | URL โลโก้บริษัท                        |
| `is_active` | boolean   | บริษัทนี้ยังใช้งานได้หรือไม่           |

**หน้าที่:** **Tenant Root** ของระบบ  
ทุก feature, member, role ต้องผูกกับ `company` เสมอ  
`slug` ใช้เป็น URL path เพื่อ routing แบบ multi-tenant เช่น `/acme/dashboard`

---

### 2.2 `company_branch`

| Column       | Type      | คำอธิบาย                      |
| ------------ | --------- | ----------------------------- |
| `id`         | uuid (PK) | UUIDv7 Primary Key            |
| `company_id` | uuid (FK) | อ้างอิงไปยัง `company.id`     |
| `name`       | text      | ชื่อสาขา เช่น "สาขาเชียงใหม่" |
| `address`    | text      | ที่อยู่สาขา                   |
| `is_active`  | boolean   | สาขาเปิดใช้งานอยู่หรือไม่     |

**หน้าที่:** แบ่ง company ออกเป็น **สาขาย่อย**  
`company_member` ผูกกับ branch เพื่อบอกว่า member คนนี้สังกัดสาขาไหน

---

### 2.3 `company_member`

| Column              | Type      | คำอธิบาย                      |
| ------------------- | --------- | ----------------------------- |
| `id`                | uuid (PK) | UUIDv7 Primary Key            |
| `company_branch_id` | uuid (FK) | สาขาที่สังกัด                 |
| `company_id`        | uuid (FK) | บริษัทที่สังกัด               |
| `user_id`           | uuid (FK) | ผู้ใช้ที่เป็นสมาชิก           |
| `role_id`           | uuid (FK) | Role ที่ได้รับในบริษัทนี้     |
| `is_active`         | boolean   | membership ยังมีผลอยู่หรือไม่ |

**หน้าที่:** **Junction ระหว่าง User ↔ Company**  
1 user สามารถเป็นสมาชิกในหลาย company ได้ (multi-tenant)  
กฎธุรกิจให้หนึ่ง user มีหนึ่ง membership ต่อบริษัท โดย CreateCompanyMemberUseCase ตรวจข้อมูลซ้ำก่อนสร้าง แต่ Drizzle/DBML ปัจจุบันมีเพียง index ธรรมดา `(company_id, user_id)` จึงยังไม่กันข้อมูลซ้ำจาก concurrent requests ในระดับฐานข้อมูล ไม่ควรถือว่ามี unique constraint แล้ว

เส้น `company_member.role_id → role.id` ใน DBML แสดงความสัมพันธ์เชิงออกแบบ; Drizzle ปัจจุบันไม่ได้ประกาศ FK นี้ และตรวจ Role ผ่าน use case

> **เหตุผลที่มี `company_member` แยก:** แยก "ตัวตน" (user) ออกจาก "สมาชิกภาพในองค์กร" (company_member)  
> ทำให้ user คนเดียวทำงานได้หลายบริษัทด้วย role ที่ต่างกัน

---

### 2.4 `role`

| Column              | Type      | คำอธิบาย                                                    |
| ------------------- | --------- | ----------------------------------------------------------- |
| `id`                | uuid (PK) | UUIDv7 Primary Key                                          |
| `company_id`        | uuid (FK) | บริษัทที่ role นี้สังกัด — `NULL` = System Default          |
| `name`              | text      | ชื่อ role เช่น "HR Admin", "Security Guard"                 |
| `role_type`         | enum      | ประเภท: `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MEMBER`, `VIEWER` |
| `is_system_default` | boolean   | เป็น role default ของระบบหรือเปล่า                          |

**หน้าที่:** กำหนด **บทบาทและลำดับชั้น** ภายในองค์กร

- `company_id = NULL` + `is_system_default = true` → Role ระดับ Platform (เช่น SUPER_ADMIN)
- `company_id = <uuid>` → Role ที่บริษัทสร้างเอง (Custom Role)

`role_type` ระบุประเภทบทบาทและใช้กับกฎเฉพาะ เช่นการตรวจ Owner; สิทธิ์ action ต้องตรวจ permission ที่มอบหมายจริง ไม่ได้ให้ OWNER ทุกสิทธิ์โดยอัตโนมัติจากค่า enum เพียงอย่างเดียว

---

### 2.5 `permission`

| Column        | Type      | คำอธิบาย                                                   |
| ------------- | --------- | ---------------------------------------------------------- |
| `id`          | uuid (PK) | UUIDv7 Primary Key                                         |
| `feature_id`  | uuid (FK) | ฟีเจอร์ที่ permission นี้สังกัด — `NULL` = Core Permission |
| `action`      | text      | รหัส action unique เช่น `user:company:invite`              |
| `module`      | text      | module ที่เป็นเจ้าของ เช่น `user`, `company`, `feature`    |
| `description` | text      | คำอธิบาย permission นี้ทำอะไร                              |

**หน้าที่:** **Atomic Permission Catalog** — ระบุสิทธิ์ที่ละเอียดที่สุดในระบบ  
ตาม convention `module:resource:action` เช่น:

- `user:company:invite`
- `company:role:manage`
- `feature:company:assign`

`feature_id` ทำให้รู้ว่า permission นี้อยู่ใน feature group ไหน → ใช้ inherit permission ตาม feature ที่บริษัทสมัครไว้

---

### 2.6 `role_permission`

| Column          | Type      | คำอธิบาย             |
| --------------- | --------- | -------------------- |
| `id`            | uuid (PK) | UUIDv7 Primary Key   |
| `role_id`       | uuid (FK) | Role ที่ได้รับสิทธิ์ |
| `permission_id` | uuid (FK) | Permission ที่มอบให้ |

**หน้าที่:** **Many-to-Many junction** ระหว่าง `role` ↔ `permission`  
กำหนดว่า role ไหน ทำอะไรได้บ้าง  
Drizzle/DBML ปัจจุบันมี index ธรรมดา `(role_id, permission_id)` แม้ชื่อ index คือ `role_permission_unique_idx` จึงยังไม่บังคับป้องกันคู่ซ้ำในฐานข้อมูล

---

## 3. Feature Management

กลุ่มตารางที่ดูแล **Feature Entitlement** — บริษัทไหนเปิดใช้ feature ไหนได้บ้าง

### 3.1 `feature`

| Column      | Type      | คำอธิบาย                                                 |
| ----------- | --------- | -------------------------------------------------------- |
| `id`        | uuid (PK) | UUIDv7 Primary Key                                       |
| `code`      | text      | รหัสอ้างอิง unique เช่น `EMPLOYEE_MANAGEMENT`, `PAYROLL` |
| `name`      | text      | ชื่อแสดงผล เช่น "ระบบจัดการพนักงาน"                      |
| `category`  | text      | หมวดหมู่ เช่น `HR`, `SECURITY`, `FINANCE`, `CORE`        |
| `is_active` | boolean   | เปิดใช้งานระดับ Platform (Global Master Switch)          |

**หน้าที่:** **Master Catalog** ของ feature ทั้งหมดในระบบ  
กำหนดและดูแลโดย Super Admin เท่านั้น  
เปรียบเหมือน "เมนู" ที่ Super Admin ตัดสินใจว่าระบบมี feature อะไรบ้าง

---

### 3.2 `company_feature`

| Column        | Type      | คำอธิบาย                                      |
| ------------- | --------- | --------------------------------------------- |
| `id`          | uuid (PK) | UUIDv7 Primary Key                            |
| `company_id`  | uuid (FK) | บริษัทที่ได้รับสิทธิ์                         |
| `feature_id`  | uuid (FK) | Feature ที่มอบหมายให้                         |
| `is_enabled`  | boolean   | Super Admin เปิด/ปิดการใช้งาน                 |
| `assigned_by` | uuid (FK) | Super Admin ผู้ทำการมอบหมาย                   |
| `expires_at`  | timestamp | วันหมดอายุ (สำหรับ Subscription / Trial Plan) |

**หน้าที่:** **Entitlement Layer** — กำหนดว่าบริษัทไหน "ซื้อ" feature ไหนแล้ว  
Composite unique index `(company_id, feature_id)` ป้องกัน assign ซ้ำ  
ถ้า `expires_at` ผ่านไปแล้ว → ระบบถือว่าบริษัทไม่มีสิทธิ์ใช้ feature นั้นแล้ว

---

### 3.3 `role_feature`

| Column       | Type      | คำอธิบาย                                  |
| ------------ | --------- | ----------------------------------------- |
| `id`         | uuid (PK) | UUIDv7 Primary Key                        |
| `company_id` | uuid (FK) | บริษัทเจ้าของ (Tenant Boundary)           |
| `role_id`    | uuid (FK) | Role ที่ได้รับสิทธิ์เข้าถึง feature       |
| `feature_id` | uuid (FK) | Feature ที่มอบหมายให้ Role                |
| `is_enabled` | boolean   | เปิด/ปิดการเข้าถึง feature นี้สำหรับ role |

**หน้าที่:** **Admin ของบริษัท** กำหนดว่า Role ไหนเข้าถึง Feature ไหนได้บ้าง  
(ภายใต้สิทธิ์ที่ `company_feature` อนุญาตไว้)  
เปรียบเหมือน "ซับ layer" ภายใน company — Super Admin ให้สิทธิ์ feature กับ company แล้ว company admin กระจายต่อให้ role

---

## 4. Attendance Module (ระบบเช็คชื่อเข้างาน)

กลุ่มตารางที่ดูแล **ระบบบันทึกเวลาเข้างานของพนักงาน (Attendance & Time Tracking)**  
ออกแบบโดยยึดหลัก **Clean Architecture & Domain Separation**:

- **ตำแหน่งงาน (Position)** ใช้ตาราง `role` ที่มีอยู่แล้วในระบบ (ไม่ต้องสร้างตารางตำแหน่งซ้ำซ้อน)
- **พนักงาน (Employee)** ใช้ตาราง `company_member` ที่ผูกระหว่าง `user` ↔ `company` ↔ `role`
- **รองรับรอบการเช็คชื่อแบบ Dynamic**: แต่ละตำแหน่งงาน (Role) สามารถตั้งค่าช่วงเวลาและจำนวนรอบการเช็คชื่อต่อวันได้อิสระ เช่น
  - _แม่บ้าน:_ เช็ค 2 รอบ (เช้า, เย็น)
  - _พนักงานทั่วไป:_ เช็ค 3 รอบ (เช้า, กลางวัน, เย็น)
  - _หัวหน้างาน:_ เช็ค 1 รอบ (เช้า)

---

### Enum Definitions

#### `attendance_status`

สถานะการลงเวลาของพนักงานในแต่ละรอบ (Slot)

| ค่า       | ความหมาย         | คำอธิบายเงื่อนไข                                                                        |
| --------- | ---------------- | --------------------------------------------------------------------------------------- |
| `present` | มาทำงาน          | ลงเวลาสำเร็จภายในช่วงเวลาที่กำหนด (`window_start` ถึง `window_end`)                     |
| `late`    | มาสาย            | ลงเวลาหลังจากเวลามาตรฐานที่อนุญาต หรือเกินเกณฑ์เริ่มงานแต่ยังอยู่ในกรอบที่ระบบรับบันทึก |
| `absent`  | ขาดงาน           | ไม่มีการลงเวลาตลอดช่วงเวลาที่กำหนดของรอบนั้น (ค่าเริ่มต้นของระบบ)                       |
| `excused` | ลางาน (มีเหตุผล) | ได้รับการอนุมัติการลาจากระบบ Leave Management หรือบันทึกโดยหัวหน้างาน/Admin             |

---

### 4.1 `check_in_schedules`

ตารางกำหนดแม่แบบตารางเวลาเช็คชื่อต่อตำแหน่งงาน (Role) ภายในแต่ละบริษัท

| Column       | Type      | คำอธิบาย                                                                          |
| ------------ | --------- | --------------------------------------------------------------------------------- |
| `id`         | uuid (PK) | UUIDv7 Primary Key                                                                |
| `role_id`    | uuid (FK) | อ้างอิงไปยัง `role.id` — **1 Role มีได้ 1 Schedule** (Unique)                     |
| `company_id` | uuid (FK) | อ้างอิงไปยัง `company.id` (Denormalized เพื่อ Tenant Isolation & Fast Query)      |
| `name`       | text      | ชื่อ Schedule เช่น _"แม่บ้าน 2 รอบ"_, _"พนักงานออฟฟิศ 3 รอบ"_, _"รปภ. กะกลางวัน"_ |
| `is_active`  | boolean   | สถานะเปิดใช้งานตารางเวลานี้ (default: `true`)                                     |
| `created_at` | timestamp | วันเวลาที่สร้างตาราง                                                              |
| `updated_at` | timestamp | วันเวลาที่แก้ไขล่าสุด                                                             |

**Indexes & Constraints:**

- `role_id` (Unique Index: `check_in_schedule_role_id_unique`) — บังคับว่า 1 Role จะมี Schedule ได้เพียง 1 รูปแบบ
- `company_id` (Index: `check_in_schedule_company_id_idx`) — ค้นหา Schedule ทั้งหมดในระดับบริษัท

**หน้าที่:** เป็นศูนย์กลางการกำหนด **นโยบายการลงเวลา (Attendance Policy)** ของแต่ละตำแหน่งงานในบริษัท โดย Admin สามารถเพิ่ม/แก้ไข/เปิด-ปิด Schedule ได้แบบ Dynamic โดยไม่ต้องแก้โค้ด

---

### 4.2 `schedule_slots`

ตารางกำหนด **แต่ละรอบ (Slot)** ใน 1 วันของ Schedule นั้นๆ

| Column                 | Type      | คำอธิบาย                                                                           |
| ---------------------- | --------- | ---------------------------------------------------------------------------------- |
| `id`                   | uuid (PK) | UUIDv7 Primary Key                                                                 |
| `check_in_schedule_id` | uuid (FK) | อ้างอิงไปยัง `check_in_schedules.id` (ลบตามเมื่อ Schedule ถูกลบ - Cascade)         |
| `slot_order`           | integer   | ลำดับรอบใน 1 วัน (เช่น `1` = รอบแรก/เช้า, `2` = รอบสอง/กลางวัน, `3` = รอบสาม/เย็น) |
| `label`                | text      | ป้ายชื่อแสดงผลของรอบ เช่น _"รอบเช้า"_, _"รอบกลางวัน"_, _"รอบเย็น"_, _"ตรวจเวรค่ำ"_ |
| `window_start`         | time      | เวลาเริ่มต้นที่เปิดรับการเช็คชื่อ เช่น `07:00:00`                                  |
| `window_end`           | time      | เวลาสิ้นสุดที่ปิดรับการเช็คชื่อ เช่น `09:00:00`                                    |
| `is_required`          | boolean   | บังคับต้องเช็คในรอบนี้หรือไม่ (default: `true`)                                    |
| `created_at`           | timestamp | วันเวลาที่สร้างรอบ                                                                 |
| `updated_at`           | timestamp | วันเวลาที่แก้ไขล่าสุด                                                              |

**Indexes & Constraints:**

- `check_in_schedule_id` (Index: `schedule_slot_schedule_id_idx`)
- `(check_in_schedule_id, slot_order)` (Composite Unique: `schedule_slot_order_unique`) — ลำดับรอบใน Schedule เดียวกันต้องไม่ซ้ำกัน

**หน้าที่:** กำหนดหน้าต่างเวลา (Time Window) สำหรับการเช็คชื่อในแต่ละรอบ รองรับการกำหนดจำนวนรอบได้ตั้งแต่ 1 รอบจนถึงหลายรอบตามต้องการของแต่ละตำแหน่งงาน

---

### 4.3 `attendance_logs`

ตารางบันทึกประวัติการเช็คชื่อเข้างานจริงของพนักงาน

| Column              | Type      | คำอธิบาย                                                                                        |
| ------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `id`                | uuid (PK) | UUIDv7 Primary Key                                                                              |
| `company_member_id` | uuid (FK) | อ้างอิงไปยัง `company_member.id` (พนักงานผู้ลงเวลา)                                             |
| `schedule_slot_id`  | uuid (FK) | อ้างอิงไปยัง `schedule_slots.id` (รอบการลงเวลาที่บันทึก)                                        |
| `work_date`         | date      | วันที่ทำงาน (YYYY-MM-DD) เช่น `2026-09-06`                                                      |
| `checked_in_at`     | timestamp | วันเวลาจริงที่ทำการกดเช็คชื่อ (`NULL` หากขาดงานหรือยังไม่ได้เช็ค)                               |
| `status`            | enum      | สถานะการลงเวลา (`present`, `absent`, `late`, `excused`)                                         |
| `note`              | text      | หมายเหตุเพิ่มเติม เช่น _"ลากิจ (อนุมัติผ่านระบบ)"_, _"สแกนนิ้วขัดข้อง"_                         |
| `recorded_by`       | uuid (FK) | อ้างอิงไปยัง `user.id` ของ Supervisor/Admin ที่บันทึกแทนหรือ Override (`NULL` ถ้าเช็คด้วยตนเอง) |
| `created_at`        | timestamp | วันเวลาที่สร้างเรคคอร์ด                                                                         |
| `updated_at`        | timestamp | วันเวลาที่แก้ไขล่าสุด                                                                           |

**Indexes & Constraints:**

- `company_member_id` (Index: `attendance_log_member_id_idx`) — ค้นหาประวัติการลงเวลาของพนักงาน
- `schedule_slot_id` (Index: `attendance_log_slot_id_idx`) — ค้นหาตามรอบเวลา
- `work_date` (Index: `attendance_log_work_date_idx`) — กรองรายงานตามช่วงวันที่
- `(company_member_id, schedule_slot_id, work_date)` (Composite Unique: `attendance_log_unique_per_slot_per_day`) — **ป้องกันการบันทึกเวลาซ้ำในรอบเดียวกันของวันนั้นเด็ดขาด**

**หน้าที่:** บันทึกข้อมูลการเข้างานระดับ Transaction 1 เรคคอร์ดแทนการเข้างานของพนักงาน 1 คน ใน 1 รอบ ของ 1 วัน พร้อมรองรับ Audit Trail (ใครเป็นผู้บันทึก/แก้ไข)

---

## 5. Leave Management Module (ระบบขอลา)

กลุ่มตารางที่ดูแล **การขอลาหยุดงาน (Leave Requests), ประเภทการลา (Leave Types), และโควต้าวันลาประจำปี (Leave Quotas)**  
ทำงานผสานอย่างใกล้ชิดกับระบบ Attendance เมื่อคำขอลาได้รับการอนุมัติ

---

### Enum Definitions

#### `leave_request_status`

สถานะของคำขอลาในกระบวนการพิจารณา (Approval Workflow)

| ค่า         | ความหมาย       | คำอธิบาย                                                                    |
| ----------- | -------------- | --------------------------------------------------------------------------- |
| `pending`   | รอการอนุมัติ   | พนักงานยื่นคำขอแล้ว อยู่ในระหว่างรอหัวหน้างาน/Admin ตรวจสอบ                 |
| `approved`  | อนุมัติแล้ว    | ผ่านการอนุมัติ โควต้าวันลาถูกหัก และระบบ Attendance ปรับสถานะเป็น `excused` |
| `rejected`  | ปฏิเสธ         | ไม่อนุมัติคำขอ พร้อมระบุเหตุผลใน `review_note` โควต้าไม่ถูกหัก              |
| `cancelled` | ยกเลิกโดยผู้ขอ | พนักงานกดยกเลิกคำขอก่อนหรือหลังการพิจารณา (คืนโควต้าหากเคย approved)        |

#### `leave_unit`

หน่วยการนับเวลาที่ขอลา

| ค่า        | ความหมาย | คำอธิบาย                                            |
| ---------- | -------- | --------------------------------------------------- |
| `day`      | เต็มวัน  | นับเป็นจำนวนเต็มวัน เช่น 1 วัน, 2 วัน               |
| `half_day` | ครึ่งวัน | นับเป็น 0.5 วัน (เช้า หรือ บ่าย)                    |
| `hour`     | ชั่วโมง  | นับเป็นจำนวนชั่วโมง (สำหรับการลาเฉพาะช่วงเวลาสั้นๆ) |

---

### 5.1 `leave_types`

ตารางนิยามประเภทการลาที่บริษัทเปิดให้พนักงานลาได้

| Column              | Type      | คำอธิบาย                                                                         |
| ------------------- | --------- | -------------------------------------------------------------------------------- |
| `id`                | uuid (PK) | UUIDv7 Primary Key                                                               |
| `company_id`        | uuid (FK) | อ้างอิงไปยัง `company.id` (Tenant Scoped)                                        |
| `name`              | text      | ชื่อประเภทการลา เช่น _"ลาป่วย"_, _"ลากิจ"_, _"ลาพักร้อน"_, _"ลาคลอด"_, _"ลาบวช"_ |
| `description`       | text      | รายละเอียดเงื่อนไขและข้อกำหนดในการลา                                             |
| `unit`              | enum      | หน่วยนับเริ่มต้น (`day`, `half_day`, `hour`)                                     |
| `requires_proof`    | boolean   | บังคับแนบเอกสาร/ใบรับรองแพทย์หรือไม่ (เช่น ลาป่วยเกิน 2 วัน)                     |
| `max_days_per_year` | integer   | จำนวนวันลาสูงสุดตามสิทธิ์ต่อปี (`NULL` = ไม่จำกัดจำนวนวัน)                       |
| `is_paid`           | boolean   | ลาโดยได้รับค่าจ้างหรือไม่ (`true` = Paid Leave, `false` = Unpaid Leave)          |
| `is_active`         | boolean   | เปิดใช้งานประเภทการลานี้หรือไม่ (default: `true`)                                |
| `created_at`        | timestamp | วันเวลาที่สร้าง                                                                  |
| `updated_at`        | timestamp | วันเวลาที่แก้ไขล่าสุด                                                            |

**Indexes & Constraints:**

- `company_id` (Index: `leave_type_company_id_idx`)
- `(company_id, name)` (Composite Unique: `leave_type_company_name_unique`) — ชื่อประเภทการลาต้องไม่ซ้ำกันภายในบริษัทเดียวกัน

**หน้าที่:** แคตตาล็อกประเภทการลาของแต่ละบริษัท แต่ละบริษัทสามารถตั้งค่านโยบายวันลาของตนเองได้อย่างอิสระ

---

### 5.2 `leave_quotas`

ตารางเก็บยอดโควต้าวันลาต่อปีของสมาชิกแต่ละคนในแต่ละประเภทการลา

| Column              | Type      | คำอธิบาย                                                             |
| ------------------- | --------- | -------------------------------------------------------------------- |
| `id`                | uuid (PK) | UUIDv7 Primary Key                                                   |
| `company_member_id` | uuid (FK) | อ้างอิงไปยัง `company_member.id`                                     |
| `leave_type_id`     | uuid (FK) | อ้างอิงไปยัง `leave_types.id`                                        |
| `year`              | integer   | ปีที่ได้รับสิทธิ์ (ค.ศ. เช่น `2026`)                                 |
| `total_days`        | decimal   | โควตาวันลาทั้งหมดที่ได้รับในปีนั้น (รองรับทศนิยม เช่น `6.0`, `15.0`) |
| `used_days`         | decimal   | จำนวนวันลาที่ใช้ไปแล้ว (default: `0`, ปรับปรุงอัตโนมัติเมื่ออนุมัติ) |
| `created_at`        | timestamp | วันเวลาที่สร้างเรคคอร์ด                                              |
| `updated_at`        | timestamp | วันเวลาที่แก้ไขล่าสุด                                                |

**Indexes & Constraints:**

- `company_member_id` (Index: `leave_quota_member_id_idx`)
- `leave_type_id` (Index: `leave_quota_type_id_idx`)
- `(company_member_id, leave_type_id, year)` (Composite Unique: `leave_quota_member_type_year_unique`) — พนักงาน 1 คน มีโควต้าประเภทการลาเดียวกันในปีเดียวกันได้ 1 เรคคอร์ดเท่านั้น

**หน้าที่:** จัดการ Balance วันลาของพนักงาน:
$$\text{วันลาคงเหลือ} = \text{total\_days} - \text{used\_days}$$
ระบบจะใช้ข้อมูลนี้ตรวจสอบก่อนให้พนักงานยื่นคำขอลาว่ามีวันลาคงเหลือเพียงพอหรือไม่

---

### 5.3 `leave_requests`

ตารางบันทึกคำขอลาหยุดงานและประวัติการพิจารณาอนุมัติ

| Column              | Type      | คำอธิบาย                                                              |
| ------------------- | --------- | --------------------------------------------------------------------- |
| `id`                | uuid (PK) | UUIDv7 Primary Key                                                    |
| `company_member_id` | uuid (FK) | อ้างอิงไปยัง `company_member.id` (ผู้ยื่นขอลา)                        |
| `leave_type_id`     | uuid (FK) | อ้างอิงไปยัง `leave_types.id` (ประเภทการลาที่ขอ)                      |
| `start_date`        | date      | วันที่เริ่มต้นลา (YYYY-MM-DD)                                         |
| `end_date`          | date      | วันที่สิ้นสุดการลา (YYYY-MM-DD)                                       |
| `total_days`        | decimal   | จำนวนวันที่ขอลาทั้งหมด (คำนวณตามปฏิทินวันทำงาน)                       |
| `unit`              | enum      | หน่วยการลาที่ระบุ (`day`, `half_day`, `hour`)                         |
| `reason`            | text      | เหตุผลและความจำเป็นในการลา                                            |
| `proof_url`         | text      | ลิงก์ไฟล์แนบหลักฐาน (รูปถ่ายใบรับรองแพทย์, เอกสารราชการ)              |
| `status`            | enum      | สถานะคำขอ (`pending`, `approved`, `rejected`, `cancelled`)            |
| `reviewed_by`       | uuid (FK) | อ้างอิงไปยัง `user.id` ของผู้อนุมัติ/ปฏิเสธ (`NULL` ระหว่างรอพิจารณา) |
| `reviewed_at`       | timestamp | วันเวลาที่มีการอนุมัติหรือปฏิเสธคำขอ                                  |
| `review_note`       | text      | บันทึกความเห็นจากผู้อนุมัติ (เช่น เหตุผลในการไม่อนุมัติ)              |
| `created_at`        | timestamp | วันเวลาที่ยื่นคำขอ                                                    |
| `updated_at`        | timestamp | วันเวลาที่แก้ไขล่าสุด                                                 |

**Indexes & Constraints:**

- `company_member_id` (Index: `leave_request_member_id_idx`)
- `leave_type_id` (Index: `leave_request_type_id_idx`)
- `status` (Index: `leave_request_status_idx`) — กรองคำขอที่รอการอนุมัติ (`pending`) สำหรับ Dashboard หัวหน้างาน
- `(company_member_id, start_date, end_date)` (Index: `leave_request_member_date_idx`) — ตรวจสอบช่วงเวลาลาซ้อนทับ (Overlapping leaves)

**หน้าที่:** ขับเคลื่อน **Approval Workflow** ตั้งแต่พนักงานส่งคำขอ ➔ ส่งแจ้งเตือนไปยังหัวหน้างาน ➔ อนุมัติ/ปฏิเสธ ➔ บันทึกผลย้อนกลับสู่โควต้าและตารางเวลาการลงงาน

---

## 6. ความสัมพันธ์ระหว่างโมดูลและการทำงาน (Cross-Module Integration & Workflows)

### 6.1 การแมปแนวคิดระดับโดเมน (Core Domain Mapping)

ในการออกแบบระบบให้สอดคล้องกับโครงสร้างเดิมโดยไม่ต้องสร้างตารางซ้ำซ้อน:

1. **"ตำแหน่งงาน" (Position) $\rightarrow$ ใช้ตาราง `role`**  
   ในแต่ละบริษัท Role ทำหน้าที่เป็นทั้งตำแหน่งงานทางธุรกิจ (เช่น แม่บ้าน, พนักงานทั่วไป, หัวหน้างาน) และเป็นตัวกำหนด Role Type ทางการเข้าถึงระบบ โดย `check_in_schedules.role_id` เชื่อมตรงไปยัง `role.id` แบบ 1:1
2. **"พนักงาน" (Employee) $\rightarrow$ ใช้ตาราง `company_member`**  
   พนักงานในระบบคือสมาชิกของบริษัท (`company_member`) ซึ่งมีข้อมูลเชื่อมโยงครบถ้วน:
   - สังกัดบริษัทใด (`company_id`)
   - ปฏิบัติงานที่สาขาไหน (`company_branch_id`)
   - ดำรงตำแหน่ง/บทบาทอะไร (`role_id`)
   - บัญชีผู้ใช้ในระบบ (`user_id` — อ้างอิงตัวตนจริง, รูปถ่าย, อีเมล)

```
[company] ──1:N── [company_branch]
   │                      │
   ├──1:N── [role]        │
   │          │ (1:1)     │
   │   [check_in_schedules]
   │          │ (1:N)     │
   │    [schedule_slots]  │
   │                      │
   └──1:N── [company_member] ──N:1── [user]
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
[attendance_logs]      [leave_requests]
                             │
                       [leave_quotas]
```

---

### 6.2 Workflow: การกำหนดรอบเวลาและการลงเวลา (Dynamic Attendance Workflow)

```
[Admin / HR]
     │
     ▼ 1. สร้าง Role "แม่บ้าน" ใน [role]
     ▼ 2. สร้าง Schedule ใน [check_in_schedules] (role_id = แม่บ้าน)
     ▼ 3. สร้าง Slots ใน [schedule_slots]:
          - Slot 1: "เช้า"  (07:00 - 09:00, is_required = true)
          - Slot 2: "เย็น"  (16:00 - 18:00, is_required = true)

[พนักงานแม่บ้าน (company_member)]
     │
     ├── 07:45 น. ── เช็คชื่อรอบเช้า
     │    │
     │    ▼ ตรวจสอบ ScheduleSlot (07:00 <= 07:45 <= 09:00)
     │    ▼ บันทึก [attendance_logs] (status = 'present', checked_in_at = 07:45)
     │
     ├── 16:30 น. ── ไม่ได้มากดเช็คชื่อรอบเย็น
     │    │
     │    ▼ เมื่อพ้น 18:00 น. (หมด Window)
     │    ▼ ระบบ/Job สรุป [attendance_logs] (status = 'absent', checked_in_at = NULL)
```

**กฎการตรวจสอบเวลา (Window Validation Logic):**

- ถ้า `checked_in_at` อยู่ในช่วง `[window_start, window_end]` $\rightarrow$ `status = 'present'`
- ถ้า `checked_in_at` เกินเกณฑ์เวลาเข้างานปกติแต่ยังอยู่ในช่วงสายที่อนุญาต $\rightarrow$ `status = 'late'`
- หากหมดช่วงเวลา `window_end` แล้วยังไม่มีบันทึก $\rightarrow$ บันทึก `status = 'absent'`
- **Unique Constraint Check:** หากมีการพยายามเช็คชื่อซ้ำใน `(company_member_id, schedule_slot_id, work_date)` ระบบจะ reject ทันที

---

### 6.3 Workflow: การขอลาและการสะท้อนผลสู่การเช็คชื่อ (Leave & Attendance Sync Flow)

เมื่อพนักงานต้องการลางาน กระบวนการทำงานระหว่างโมดูลจะเป็นไปตามลำดับดังนี้:

```
[พนักงาน (company_member)]
     │
     ▼ 1. ยื่นคำขอใน [leave_requests] (เช่น ลาป่วย 2026-09-07 ถึง 2026-09-08 = 2 วัน)
     ▼ 2. ตรวจสอบ [leave_quotas]:
          (total_days - used_days >= 2 วัน) --> ผ่าน (Quota Available)

[หัวหน้างาน / HR (user)]
     │
     ▼ 3. ตรวจสอบคำขอ พร้อมดูหลักฐาน [proof_url]
     ▼ 4. อนุมัติคำขอ (Action: Approve)
          │
          ├── อัปเดต [leave_requests]:
          │   - status = 'approved'
          │   - reviewed_by = user.id
          │   - reviewed_at = now()
          │
          ├── หักโควต้า [leave_quotas]:
          │   - used_days = used_days + 2.0
          │
          └── ทำการ Auto-Sync ไปยัง [attendance_logs]:
              สำหรับทุกวันในช่วงลา (2026-09-07, 2026-09-08):
              สำหรับทุก ScheduleSlot ของ Role ของพนักงานคนนั้น:
              Upsert [attendance_logs]:
                - work_date = <วันนั้น>
                - schedule_slot_id = <slot_id>
                - status = 'excused'
                - note = 'ลางาน: ลาป่วย (อนุมัติแล้ว)'
                - recorded_by = <reviewed_by user_id>
```

> **ผลลัพธ์:** ในวันและรอบที่พนักงานได้รับอนุมัติการลา พนักงานจะไม่ถูกระบบตัดเป็น "ขาดงาน (absent)" แต่จะแสดงสถานะเป็น "ลา (excused)" ในรายงานสรุปการเข้างานทันที

---

### 6.4 Tenant Isolation & Security Boundary

ระบบรักษาความปลอดภัยระดับองค์กร (Multi-Tenant Architecture) ทำงานควบคู่กัน:

1. **Tenant Scoping:**
   - ข้อมูลการตั้งค่า (`check_in_schedules`, `leave_types`) ผูกกับ `company_id`
   - พนักงาน (`company_member`) ผูกกับ `company_id` อย่างชัดเจน
   - คิวรีทุกคำสั่งต้องมีเงื่อนไข `WHERE company_id = :active_company_id`
2. **Feature Entitlement Check:**
   - ก่อนที่บริษัทจะใช้งานระบบ Attendance หรือ Leave Management ได้ Super Admin ต้องเปิดสิทธิ์ฟีเจอร์ใน `company_feature` ด้วยรหัส `ATTENDANCE` และ `LEAVE_MANAGEMENT`
   - Company Admin ต้องกระจายสิทธิ์ต่อให้ Role ภายในบริษัทผ่าน `role_feature`

---

## 7. สรุปตารางทั้งหมดและ Entity-Relationship Architecture

### 7.1 ภาพรวม Table Groups ทั้ง 5 กลุ่ม

| Table Group                  | ตารางที่สังกัด                                                                         | ขอบเขตหน้าที่                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **1. auth_management**       | `user`, `account`, `session`, `verification`, `jwks`                                   | Identity, Session, Credentials, OAuth, JWT Verification                   |
| **2. organization_and_rbac** | `company`, `company_branch`, `company_member`, `role`, `permission`, `role_permission` | Multi-Tenant Workspace, สาขา, พนักงาน/สมาชิก, ตำแหน่งงาน, สิทธิ์ granular |
| **3. feature_management**    | `feature`, `company_feature`, `role_feature`                                           | Master Catalog ฟีเจอร์, Tenant Entitlement, สิทธิ์ระดับ Role              |
| **4. attendance_module**     | `check_in_schedules`, `schedule_slots`, `attendance_logs`                              | นโยบายการเช็คชื่อตามตำแหน่ง, รอบเวลา dynamic, บันทึกการลงเวลาจริง         |
| **5. leave_management**      | `leave_types`, `leave_quotas`, `leave_requests`                                        | ประเภทการลา, โควต้าสะสมประจำปี, คำขอและการอนุมัติการลา                    |

---

### 7.2 สรุปความสัมพันธ์ Foreign Key ทั้งหมดในระบบ

```
[user] ◄── account.user_id
[user] ◄── session.user_id
[user] ◄── company_member.user_id
[user] ◄── company_feature.assigned_by
[user] ◄── attendance_logs.recorded_by
[user] ◄── leave_requests.reviewed_by

[company] ◄── session.active_company_id
[company] ◄── company_branch.company_id
[company] ◄── company_member.company_id
[company] ◄── role.company_id
[company] ◄── company_feature.company_id
[company] ◄── role_feature.company_id
[company] ◄── check_in_schedules.company_id
[company] ◄── leave_types.company_id

[company_branch] ◄── company_member.company_branch_id

[role] ◄── company_member.role_id
[role] ◄── role_permission.role_id
[role] ◄── role_feature.role_id
[role] ◄── check_in_schedules.role_id (1:1)

[feature] ◄── permission.feature_id
[feature] ◄── company_feature.feature_id
[feature] ◄── role_feature.feature_id

[permission] ◄── role_permission.permission_id

[check_in_schedules] ◄── schedule_slots.check_in_schedule_id (1:N)

[company_member] ◄── attendance_logs.company_member_id (1:N)
[company_member] ◄── leave_quotas.company_member_id (1:N)
[company_member] ◄── leave_requests.company_member_id (1:N)

[schedule_slots] ◄── attendance_logs.schedule_slot_id (1:N)

[leave_types] ◄── leave_quotas.leave_type_id (1:N)
[leave_types] ◄── leave_requests.leave_type_id (1:N)
```

---

_รายละเอียดโมดูลเดิมอัปเดตล่าสุด: 2026-09-06; แบบเสนอ Form MVP ปรับเมื่อ 2026-09-09 ดู [เอกสารออกแบบ](inspection-form-design.md)_
