# 📦 Database Schema Documentation

> **Mini-Security** — อธิบายความหมายและหน้าที่ของแต่ละตารางในระบบ  
> อ้างอิงจาก [`erDiagram.dbml`](../erDiagram.dbml)

---

## สารบัญ

1. [Auth Management](#1-auth-management)
2. [Organization & RBAC](#2-organization--rbac)
3. [Feature Management](#3-feature-management)
4. [Attendance: Work Schedule & Shift](#4-attendance-work-schedule--shift)
5. [Attendance: Policy & Checkpoint](#5-attendance-policy--checkpoint)
6. [Attendance: Location](#6-attendance-location)
7. [Attendance: Tracking](#7-attendance-tracking)
8. [Leave Management](#8-leave-management)
9. [ความสัมพันธ์ระหว่าง Feature Groups](#9-ความสัมพันธ์ระหว่าง-feature-groups)

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
ใช้ร่วมกับ `attendance_location` เพื่อกำหนดว่าสาขานี้เช็คชื่อที่ไหนได้บ้าง  
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
Composite unique index `(company_id, user_id)` บังคับว่าใน 1 บริษัท จะมี user แต่ละคนได้ 1 membership เท่านั้น

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

`role_type` ใช้ inherit permission baseline เช่น OWNER ได้ทุกอย่าง, VIEWER ดูได้อย่างเดียว

---

### 2.5 `permission`

| Column        | Type      | คำอธิบาย                                                   |
| ------------- | --------- | ---------------------------------------------------------- |
| `id`          | uuid (PK) | UUIDv7 Primary Key                                         |
| `feature_id`  | uuid (FK) | ฟีเจอร์ที่ permission นี้สังกัด — `NULL` = Core Permission |
| `action`      | text      | รหัส action unique เช่น `attendance:check-in:create`       |
| `module`      | text      | module ที่เป็นเจ้าของ เช่น `attendance`, `leave`           |
| `description` | text      | คำอธิบาย permission นี้ทำอะไร                              |

**หน้าที่:** **Atomic Permission Catalog** — ระบุสิทธิ์ที่ละเอียดที่สุดในระบบ  
ตาม convention `module:resource:action` เช่น:

- `attendance:record:read`
- `leave:request:approve`
- `user:company:invite`

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
Composite unique index `(role_id, permission_id)` ป้องกัน duplicate

---

## 3. Feature Management

กลุ่มตารางที่ดูแล **Feature Entitlement** — บริษัทไหนเปิดใช้ feature ไหนได้บ้าง

### 3.1 `feature`

| Column      | Type      | คำอธิบาย                                                 |
| ----------- | --------- | -------------------------------------------------------- |
| `id`        | uuid (PK) | UUIDv7 Primary Key                                       |
| `code`      | text      | รหัสอ้างอิง unique เช่น `ATTENDANCE`, `LEAVE_MANAGEMENT` |
| `name`      | text      | ชื่อแสดงผล เช่น "ระบบลงเวลาเข้างาน"                      |
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

## 4. Attendance: Work Schedule & Shift

### 4.1 `work_schedule`

| Column        | Type      | คำอธิบาย                                 |
| ------------- | --------- | ---------------------------------------- |
| `id`          | uuid (PK) | UUIDv7 Primary Key                       |
| `company_id`  | uuid (FK) | บริษัทที่ตารางงานนี้สังกัด               |
| `name`        | text      | ชื่อตารางงาน เช่น "ตารางงาน Office 2025" |
| `description` | text      | คำอธิบาย                                 |
| `is_active`   | boolean   | ยังใช้งานอยู่หรือไม่                     |

**หน้าที่:** **Container** ของกะการทำงาน  
1 company มีหลาย work_schedule ได้ เช่น "ตารางสำนักงาน", "ตารางงานเวรรักษาความปลอดภัย"  
ใช้แยกกลุ่มกะงานตาม department หรือประเภทพนักงาน

---

### 4.2 `work_shift`

| Column             | Type      | คำอธิบาย                          |
| ------------------ | --------- | --------------------------------- |
| `id`               | uuid (PK) | UUIDv7 Primary Key                |
| `work_schedule_id` | uuid (FK) | ตารางงานที่กะนี้สังกัด            |
| `company_id`       | uuid (FK) | บริษัทที่เป็นเจ้าของ (fast query) |
| `name`             | text      | ชื่อกะ เช่น "กะเช้า", "กะดึก"     |
| `start_time`       | time      | เวลาเริ่มงาน                      |
| `end_time`         | time      | เวลาเลิกงาน                       |
| `is_overnight`     | boolean   | กะข้ามคืนหรือไม่                  |
| `color`            | text      | สีสำหรับแสดงบน Calendar UI        |

**หน้าที่:** กำหนด **เวลาทำงานแต่ละกะ** ภายใน work_schedule  
`is_overnight` ช่วยให้ระบบคำนวณชั่วโมงทำงานข้ามวันได้ถูกต้อง เช่น 22:00→06:00 = 8 ชั่วโมง ไม่ใช่ -16 ชั่วโมง

---

### 4.3 `role_work_schedule`

| Column           | Type      | คำอธิบาย                               |
| ---------------- | --------- | -------------------------------------- |
| `id`             | uuid (PK) | UUIDv7 Primary Key                     |
| `role_id`        | uuid (FK) | Role ที่ใช้ตารางนี้                    |
| `company_id`     | uuid (FK) | บริษัทที่เป็นเจ้าของ                   |
| `work_shift_id`  | uuid (FK) | กะที่มอบหมายให้ Role นี้               |
| `effective_date` | date      | วันที่เริ่มใช้งาน                      |
| `end_date`       | date      | วันที่สิ้นสุด (`NULL` = ยังใช้งานอยู่) |

**หน้าที่:** **มอบหมายกะงานให้ Role** รองรับ effective date  
การออกแบบด้วย `effective_date`/`end_date` รองรับ **การเปลี่ยนกะล่วงหน้า**  
เช่น ประกาศว่าเดือนหน้าจะเปลี่ยนกะโดยไม่ต้องแก้ข้อมูลทันที

---

## 5. Attendance: Policy & Checkpoint

### 5.1 `attendance_policy`

| Column        | Type      | คำอธิบาย                               |
| ------------- | --------- | -------------------------------------- |
| `id`          | uuid (PK) | UUIDv7 Primary Key                     |
| `company_id`  | uuid (FK) | บริษัทที่ policy นี้สังกัด             |
| `name`        | text      | ชื่อ policy เช่น "นโยบายพนักงานทั่วไป" |
| `description` | text      | คำอธิบาย                               |
| `is_active`   | boolean   | ยังใช้งานอยู่หรือไม่                   |

**หน้าที่:** **นโยบายการเช็คชื่อ** ระดับบริษัท  
แต่ละ policy มีชุด checkpoint ที่ต่างกัน เช่น:

- "นโยบายพนักงานออฟฟิศ" → เช็คเช้า + เย็น
- "นโยบายยาม" → เช็คทุก 4 ชั่วโมง

---

### 5.2 `attendance_checkpoint`

| Column             | Type      | คำอธิบาย                                                           |
| ------------------ | --------- | ------------------------------------------------------------------ |
| `id`               | uuid (PK) | UUIDv7 Primary Key                                                 |
| `policy_id`        | uuid (FK) | Policy ที่ checkpoint นี้สังกัด                                    |
| `check_type`       | enum      | ประเภท: `CHECK_IN`, `CHECK_OUT`, `BREAK_IN`, `BREAK_OUT`, `CUSTOM` |
| `label`            | text      | ชื่อแสดงผล เช่น "เช็คชื่อเช้า"                                     |
| `order_index`      | integer   | ลำดับการแสดงผล                                                     |
| `is_required`      | boolean   | บังคับเช็คหรือไม่                                                  |
| `window_start`     | time      | เริ่มเช็คได้เมื่อไหร่                                              |
| `window_end`       | time      | เช็คได้ถึงเมื่อไหร่                                                |
| `grace_minutes`    | integer   | นาทีผ่อนผัน                                                        |
| `require_photo`    | boolean   | บังคับถ่ายรูปหรือไม่                                               |
| `require_location` | boolean   | บังคับ GPS หรือไม่                                                 |

**หน้าที่:** กำหนด **แต่ละจุดเช็ค** ภายใน policy  
เป็น dynamic config — admin สามารถเพิ่ม/ลด checkpoint ได้โดยไม่ต้องเปลี่ยน code  
`window_start`/`window_end` ใช้จำกัดช่วงเวลาที่เช็คได้ เช่น CHECK_IN ต้องทำก่อน 09:15

---

### 5.3 `role_attendance_policy`

| Column       | Type      | คำอธิบาย               |
| ------------ | --------- | ---------------------- |
| `id`         | uuid (PK) | UUIDv7 Primary Key     |
| `role_id`    | uuid (FK) | Role ที่ใช้ policy นี้ |
| `policy_id`  | uuid (FK) | Policy ที่มอบหมาย      |
| `company_id` | uuid (FK) | Tenant boundary        |

**หน้าที่:** **Many-to-Many junction** ระหว่าง `role` ↔ `attendance_policy`  
1 role ใช้ได้หลาย policy, 1 policy ถูกใช้โดยหลาย role ได้  
Composite unique index `(role_id, policy_id)` ป้องกัน duplicate

---

## 6. Attendance: Location

### 6.1 `attendance_location`

| Column          | Type      | คำอธิบาย                                   |
| --------------- | --------- | ------------------------------------------ |
| `id`            | uuid (PK) | UUIDv7 Primary Key                         |
| `company_id`    | uuid (FK) | บริษัทที่เป็นเจ้าของ location นี้          |
| `branch_id`     | uuid (FK) | สาขาที่เชื่อมกัน (optional)                |
| `name`          | text      | ชื่อสถานที่ เช่น "สำนักงานใหญ่ อาคาร A"    |
| `location_type` | enum      | ประเภท: `FIXED`, `RADIUS`, `BRANCH`        |
| `latitude`      | decimal   | พิกัด GPS Latitude                         |
| `longitude`     | decimal   | พิกัด GPS Longitude                        |
| `radius_meters` | integer   | รัศมีที่อนุญาต (เมตร) สำหรับ `RADIUS` type |
| `address`       | text      | ที่อยู่แบบข้อความ                          |

**หน้าที่:** กำหนด **สถานที่ที่อนุญาตให้เช็คชื่อ** รองรับ 3 รูปแบบ:

- `FIXED` — ต้องอยู่ที่จุดนั้นพอดี
- `RADIUS` — อยู่ภายในรัศมีจากพิกัดที่กำหนด
- `BRANCH` — ใช้ที่อยู่ของสาขาเป็นเกณฑ์

---

### 6.2 `checkpoint_location`

| Column          | Type      | คำอธิบาย             |
| --------------- | --------- | -------------------- |
| `id`            | uuid (PK) | UUIDv7 Primary Key   |
| `checkpoint_id` | uuid (FK) | Checkpoint ที่ผูกกัน |
| `location_id`   | uuid (FK) | Location ที่อนุญาต   |

**หน้าที่:** **Many-to-Many junction** ระหว่าง `attendance_checkpoint` ↔ `attendance_location`  
1 checkpoint สามารถเช็คได้จากหลาย location (เช่น สาขาหลัก + สาขาย่อย)  
Composite unique index `(checkpoint_id, location_id)` ป้องกัน duplicate

---

## 7. Attendance: Tracking

### 7.1 `attendance_record`

| Column               | Type      | คำอธิบาย                                                   |
| -------------------- | --------- | ---------------------------------------------------------- |
| `id`                 | uuid (PK) | UUIDv7 Primary Key                                         |
| `company_id`         | uuid (FK) | บริษัท                                                     |
| `company_member_id`  | uuid (FK) | สมาชิกที่บันทึกการเข้างาน                                  |
| `work_shift_id`      | uuid (FK) | กะที่ทำงานวันนั้น                                          |
| `work_date`          | date      | วันที่ทำงาน                                                |
| `status`             | enum      | สถานะ: `PENDING`, `APPROVED`, `REJECTED`, `LATE`, `ABSENT` |
| `total_work_minutes` | integer   | รวมนาทีที่ทำงานทั้งหมด                                     |
| `overtime_minutes`   | integer   | นาที OT                                                    |
| `late_minutes`       | integer   | นาทีที่มาสาย                                               |
| `approved_by`        | uuid (FK) | Manager/Admin ที่อนุมัติ                                   |

**หน้าที่:** **บันทึกการเข้างานรายวัน (Header Record)**  
1 row = 1 คน × 1 วัน  
Composite unique index `(company_member_id, work_date)` บังคับว่าพนักงานแต่ละคนมีได้ 1 record ต่อวัน  
ใช้เป็น **summary** สำหรับระบบเงินเดือน — ดึงข้อมูลจาก `attendance_log` มาคำนวณและเก็บไว้ที่นี่

---

### 7.2 `attendance_log`

| Column                 | Type      | คำอธิบาย                                    |
| ---------------------- | --------- | ------------------------------------------- |
| `id`                   | uuid (PK) | UUIDv7 Primary Key                          |
| `attendance_record_id` | uuid (FK) | Record รายวันที่ log นี้สังกัด              |
| `checkpoint_id`        | uuid (FK) | Checkpoint ที่เช็ค                          |
| `check_type`           | enum      | ประเภทการเช็ค                               |
| `checked_at`           | timestamp | เวลาจริงที่เช็ค                             |
| `latitude`             | decimal   | พิกัด GPS ที่เช็ค                           |
| `longitude`            | decimal   | พิกัด GPS ที่เช็ค                           |
| `accuracy_meters`      | decimal   | ความแม่นยำของ GPS                           |
| `location_id`          | uuid (FK) | Location ที่ match กับพิกัด (ถ้า match ได้) |
| `is_location_valid`    | boolean   | GPS ผ่านหรือไม่                             |
| `photo_url`            | text      | URL รูปถ่าย selfie                          |
| `photo_verified`       | boolean   | รูปผ่าน AI verify แล้วหรือไม่               |
| `device_id`            | text      | Device identifier                           |
| `ip_address`           | text      | IP ที่เช็ค                                  |
| `is_manual`            | boolean   | Admin เช็คแทนหรือไม่                        |
| `manual_reason`        | text      | เหตุผลถ้า admin เช็คแทน                     |

**หน้าที่:** **Event Log ทุก event การเช็ค** (Detail Records)  
1 row = 1 event การเช็ค 1 ครั้ง  
เก็บ full audit trail ทั้ง GPS, รูปถ่าย, device fingerprint, IP  
Composite unique index `(attendance_record_id, checkpoint_id)` บังคับว่าใน 1 วัน จะเช็คแต่ละ checkpoint ได้ครั้งเดียว

> **Header–Detail Pattern:** `attendance_record` เป็น header (1 วัน), `attendance_log` เป็น detail (หลาย event ต่อวัน)

---

## 8. Leave Management

### 8.1 `leave_request`

| Column              | Type      | คำอธิบาย                                                                                      |
| ------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `id`                | uuid (PK) | UUIDv7 Primary Key                                                                            |
| `company_id`        | uuid (FK) | บริษัท                                                                                        |
| `company_member_id` | uuid (FK) | สมาชิกที่ยื่นคำขอ                                                                             |
| `leave_type`        | enum      | ประเภท: `SICK_LEAVE`, `ANNUAL_LEAVE`, `PERSONAL_LEAVE`, `MATERNITY_LEAVE`, `ABSENT_NO_REASON` |
| `status`            | enum      | สถานะ: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`                                         |
| `start_date`        | date      | วันเริ่มลา                                                                                    |
| `end_date`          | date      | วันสุดท้ายที่ลา                                                                               |
| `total_days`        | decimal   | จำนวนวันลา รองรับครึ่งวัน เช่น `0.5`, `1.5`                                                   |
| `reason`            | text      | เหตุผลการลา                                                                                   |
| `attachment_url`    | text      | URL เอกสารประกอบ เช่น ใบรับรองแพทย์                                                           |
| `reviewed_by`       | uuid (FK) | ผู้อนุมัติ                                                                                    |
| `reviewed_at`       | timestamp | วันเวลาที่อนุมัติ                                                                             |
| `review_note`       | text      | หมายเหตุจากผู้อนุมัติ                                                                         |

**หน้าที่:** บันทึก **คำขอลาหยุด** ทุกประเภท  
`total_days` ใช้ `decimal(4,1)` เพื่อรองรับการลาครึ่งวัน  
เชื่อมกับ `attendance_record` ทางตรรกะ — เมื่อ leave_request ได้รับการ approve  
ระบบจะสร้าง/อัปเดต attendance_record ของวันนั้นให้ status เป็น `APPROVED`

---

## 9. ความสัมพันธ์ระหว่าง Feature Groups

### สรุปตาราง Junction (Many-to-Many)

| Junction Table           | ซ้าย                    | ขวา                   | หมายความว่า                           |
| ------------------------ | ----------------------- | --------------------- | ------------------------------------- |
| `company_member`         | `user`                  | `company`             | user เป็นสมาชิกของ company            |
| `role_permission`        | `role`                  | `permission`          | role มี permission นี้                |
| `company_feature`        | `company`               | `feature`             | company ได้รับสิทธิ์ feature นี้      |
| `role_feature`           | `role`                  | `feature`             | role เข้าถึง feature นี้ได้           |
| `role_work_schedule`     | `role`                  | `work_shift`          | role ใช้กะนี้                         |
| `role_attendance_policy` | `role`                  | `attendance_policy`   | role ใช้ policy นี้                   |
| `checkpoint_location`    | `attendance_checkpoint` | `attendance_location` | checkpoint นี้เช็คที่ location นี้ได้ |

---

### ลำดับชั้นการควบคุม Feature

```
Super Admin
    └── กำหนด feature ใน [feature] (Global Catalog)
            └── มอบสิทธิ์ให้ company ใน [company_feature]
                    └── Company Admin กระจายให้ role ใน [role_feature]
                            └── Role เข้าถึง feature ได้
```

---

### ลำดับชั้นการตรวจสอบสิทธิ์ (Auth Check Flow)

```
Request เข้ามา
    1. ตรวจ session.token → หา user
    2. ดึง session.active_company_id → รู้ว่า tenant ไหน
    3. หา company_member (user_id + company_id) → รู้ว่า role ไหน
    4. ตรวจ role_permission → รู้ว่า action นี้ทำได้ไหม
    5. ตรวจ company_feature → feature นี้ company มีสิทธิ์ไหม
    6. ตรวจ role_feature → role นี้เข้าถึง feature นี้ได้ไหม
```

---

### Data Flow: การเช็คชื่อ 1 ครั้ง

```
[member เปิดแอป]
    ↓
ระบบดึง Role ของ member
    ↓
ดึง attendance_policy ที่ role ใช้ (via role_attendance_policy)
    ↓
ดึง attendance_checkpoint ที่ต้องเช็ควันนี้
    ↓
ตรวจสอบว่าอยู่ใน window_start/window_end หรือไม่
    ↓
[member เช็คชื่อ: ถ่ายรูป + GPS]
    ↓
ตรวจสอบ GPS กับ checkpoint_location → attendance_location
    ↓
สร้าง/อัปเดต attendance_record (daily header)
    ↓
บันทึก attendance_log (event detail)
```

---

### ความสัมพันธ์ระหว่าง Group (สรุป)

| จาก Group    | ไป Group     | FK / Junction                                   | ความหมาย                                    |
| ------------ | ------------ | ----------------------------------------------- | ------------------------------------------- |
| **Auth**     | **Org**      | `user` → `company_member`                       | user 1 คนเป็นสมาชิกได้หลาย company          |
| **Org**      | **Org**      | `company` → `company_branch`                    | company มีหลายสาขา                          |
| **Org**      | **Feature**  | `company` → `company_feature`                   | Super Admin ให้สิทธิ์ feature กับ company   |
| **Org**      | **Feature**  | `role` → `role_feature`                         | Admin กระจาย feature สู่ role ภายใน company |
| **Feature**  | **RBAC**     | `feature` → `permission`                        | Permission จัดกลุ่มตาม feature              |
| **Org**      | **Schedule** | `company` → `work_schedule`                     | แต่ละ company มีตารางงานของตัวเอง           |
| **Org**      | **Schedule** | `role` → `role_work_schedule`                   | แต่ละ role มีกะงาน                          |
| **Org**      | **Policy**   | `role` → `role_attendance_policy`               | แต่ละ role ใช้ policy การเช็คชื่อที่ต่างกัน |
| **Policy**   | **Location** | `attendance_checkpoint` → `checkpoint_location` | แต่ละ checkpoint รู้ว่าเช็คที่ไหนได้บ้าง    |
| **Location** | **Org**      | `attendance_location` → `company_branch`        | location ผูกกับสาขา                         |
| **Tracking** | **Policy**   | `attendance_log` → `attendance_checkpoint`      | ทุก log อ้างอิง checkpoint ที่เช็ค          |
| **Tracking** | **Location** | `attendance_log` → `attendance_location`        | ทุก log บันทึก location ที่ match           |
| **Tracking** | **Org**      | `attendance_record` → `company_member`          | บันทึกการเข้างานผูกกับ member               |
| **Leave**    | **Org**      | `leave_request` → `company_member`              | คำขอลาผูกกับ member                         |

---

_เอกสารนี้สร้างจาก [`erDiagram.dbml`](../erDiagram.dbml) — อัปเดตล่าสุด: 2026-09-05_
