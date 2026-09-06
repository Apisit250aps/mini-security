# 📦 Database Schema Documentation

> **Mini-Security** — อธิบายความหมายและหน้าที่ของแต่ละตารางในระบบ  
> อ้างอิงจาก [`erDiagram.dbml`](../erDiagram.dbml)

---

## สารบัญ

1. [Auth Management](#1-auth-management)
2. [Organization & RBAC](#2-organization--rbac)
3. [Feature Management](#3-feature-management)
4. [ความสัมพันธ์ระหว่าง Feature Groups](#4-ความสัมพันธ์ระหว่าง-feature-groups)

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
Composite unique index `(role_id, permission_id)` ป้องกัน duplicate

---

## 3. Feature Management

กลุ่มตารางที่ดูแล **Feature Entitlement** — บริษัทไหนเปิดใช้ feature ไหนได้บ้าง

### 3.1 `feature`

| Column      | Type      | คำอธิบาย                                                  |
| ----------- | --------- | --------------------------------------------------------- |
| `id`        | uuid (PK) | UUIDv7 Primary Key                                        |
| `code`      | text      | รหัสอ้างอิง unique เช่น `EMPLOYEE_MANAGEMENT`, `PAYROLL`  |
| `name`      | text      | ชื่อแสดงผล เช่น "ระบบจัดการพนักงาน"                       |
| `category`  | text      | หมวดหมู่ เช่น `HR`, `SECURITY`, `FINANCE`, `CORE`         |
| `is_active` | boolean   | เปิดใช้งานระดับ Platform (Global Master Switch)           |

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

## 4. ความสัมพันธ์ระหว่าง Feature Groups

### สรุปตาราง Junction (Many-to-Many)

| Junction Table    | ซ้าย        | ขวา          | หมายความว่า                        |
| ----------------- | ----------- | ------------ | ---------------------------------- |
| `company_member`  | `user`      | `company`    | user เป็นสมาชิกของ company         |
| `role_permission` | `role`      | `permission` | role มี permission นี้             |
| `company_feature` | `company`   | `feature`    | company ได้รับสิทธิ์ feature นี้   |
| `role_feature`    | `role`      | `feature`    | role เข้าถึง feature นี้ได้        |

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

### ความสัมพันธ์ระหว่าง Group (สรุป)

| จาก Group   | ไป Group    | FK / Junction                   | ความหมาย                                    |
| ----------- | ----------- | ------------------------------- | ------------------------------------------- |
| **Auth**    | **Org**     | `user` → `company_member`       | user 1 คนเป็นสมาชิกได้หลาย company          |
| **Org**     | **Org**     | `company` → `company_branch`    | company มีหลายสาขา                          |
| **Org**     | **Feature** | `company` → `company_feature`   | Super Admin ให้สิทธิ์ feature กับ company   |
| **Org**     | **Feature** | `role` → `role_feature`         | Admin กระจาย feature สู่ role ภายใน company |
| **Feature** | **RBAC**    | `feature` → `permission`        | Permission จัดกลุ่มตาม feature              |

---

_เอกสารนี้สร้างจาก [`erDiagram.dbml`](../erDiagram.dbml) — อัปเดตล่าสุด: 2026-09-06_
