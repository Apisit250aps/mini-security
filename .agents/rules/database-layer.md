---
trigger: always_on
---

# Database Layer & Migration Rules 🗄️

กฎระเบียบและมาตรฐานการทำงานกับฐานข้อมูล (PostgreSQL / Drizzle ORM) ภายใน `packages/database` เพื่อความปลอดภัย ความเป็นระเบียบ และรองรับ Multi-Tenant RBAC & Feature Management

---

## 1. กฎการตั้งชื่อ Migrations (Migration Naming Convention)

### 1.1 ข้อห้ามเด็ดขาด (Strict Prohibition)
- **ห้ามปล่อยให้ Drizzle Kit ตั้งชื่อสุ่มเด็ดขาด** (เช่น `unusual_james_howlett`, `tired_captain_flint`, `useful_carmella_unuscione`)
- เมื่อสร้าง migration ด้วยคำสั่ง `drizzle-kit generate` ต้องระบุแฟล็ก `--name <migration_name>` เสมอ เช่น:
  ```bash
  pnpm --filter @repo/database db:generate --name add_attendance_module
  ```
  หรือสร้างโฟลเดอร์/ไฟล์ด้วยชื่อ `snake_case` ที่สื่อความหมายชัดเจนตรงตามการเปลี่ยนแปลง

### 1.2 รูปแบบและโครงสร้างชื่อ Migration
ชื่อของ migration โฟลเดอร์ใน `packages/database/drizzle/` จะขึ้นต้นด้วย Timestamp ตามด้วยคำอธิบาย:
```text
YYYYMMDDHHmmss_<action>_<target_or_description>
```

### 1.3 มาตรฐานคำนำหน้า (Action Prefix Standards)

#### ก. การเปลี่ยนแปลงโครงสร้างตาราง (DDL / Schema Changes):
| Prefix | การใช้งาน | ตัวอย่างชื่อ |
|---|---|---|
| `add_` | เพิ่มตารางใหม่ หรือเพิ่มคอลัมน์ใหม่ | `add_company_branch`, `add_schedule_slots` |
| `alter_` หรือ `modify_` | ปรับปรุง data type, constraints หรือ index | `alter_attendance_logs_status`, `modify_user_email_idx` |
| `remove_` หรือ `drop_` | ลบตาราง คอลัมน์ หรือ enum ออกจากระบบ | `remove_feature_attendance`, `drop_legacy_work_shift` |
| `refactor_` | ปรับโครงสร้างชุดใหญ่ที่มีการย้ายหรือแปลงความสัมพันธ์ | `refactor_role_work_schedule` |

#### ข. การใส่ข้อมูลตั้งต้น (DML / Seed Migrations):
| Prefix | การใช้งาน | ตัวอย่างชื่อ |
|---|---|---|
| `seed_<module>_permissions` | เพิ่ม permission เฉพาะโมดูล และ map เข้า system roles | `seed_attendance_permissions`, `seed_leave_permissions` |
| `seed_features_and_permissions` | ประกาศ Master Feature Catalog พร้อมผูก permissions | `seed_features_and_permissions` |
| `seed_<module>_data` | ข้อมูลเริ่มต้นคงที่ (Static / Lookup Data) | `seed_default_leave_types` |

---

## 2. กฎการเขียน Seed Data Migrations (ตาม Feature & Permissions)

เพื่อให้ระบบ Entitlement, RBAC และ Multi-Tenant ทำงานร่วมกันได้อย่างไร้รอยต่อ ทุกการ Seed ข้อมูลต้องปฏิบัติตามมาตรฐาน 5 ส่วนดังนี้:

### 2.1 หลักการสำคัญ (Core Principles)
1. **Idempotency (รันซ้ำได้ไม่พัง):** คำสั่ง SQL ทุกบรรทัดต้องสามารถรันซ้ำกี่ครั้งก็ได้โดยไม่ error และไม่เกิดข้อมูลซ้ำซ้อน:
   - ใช้ `ON CONFLICT (...) DO UPDATE SET ...` สำหรับตารางที่มี Unique Constraint (เช่น `code`, `action`)
   - ใช้ `WHERE NOT EXISTS (SELECT 1 FROM ...)` สำหรับตารางความสัมพันธ์ junction table
2. **Statement Breakpoints:** ต้องมีคอมเมนต์ `--> statement-breakpoint` คั่นระหว่างแต่ละคำสั่ง SQL เสมอ เพื่อให้ Drizzle Migrator แยก statement ได้ถูกต้อง
3. **Feature-Permission Binding:** ทุก Permission ใหม่ **ต้องผูกกับ `feature_id` เสมอ** (ยกเว้น Core System Permissions ที่เป็นอิสระ)
4. **Tenant Isolation & Backfill:** เมื่อเพิ่ม Feature ใหม่ ต้องแน่ใจว่าได้ Backfill ให้กับบริษัทเดิม (`company_feature`) ตาม Policy ที่กำหนด

---

### 2.2 โครงสร้างมาตรฐาน 5 ขั้นตอนในไฟล์ Seed Migration

```sql
-- ============================================================================
-- Migration: <timestamp>_seed_<feature_name>_permissions
-- Description: Seed <Feature Name>, define permissions, map to system roles,
--              and backfill company feature entitlements.
-- ============================================================================

-- ขั้นตอนที่ 1: Seed Master Feature Catalog (ตาราง "feature")
-- ----------------------------------------------------------------------------
INSERT INTO "feature" ("id", "code", "name", "description", "category", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'ATTENDANCE_MANAGEMENT', 'Attendance Management', 'ระบบลงเวลาเข้างาน บันทึกกะ และตารางงาน', 'HR', true, now(), now())
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = now();

--> statement-breakpoint

-- ขั้นตอนที่ 2: Seed Permissions (ตาราง "permission")
-- Format action: "<module>:<action>" หรือ "<module>:<resource>:<action>"
-- ----------------------------------------------------------------------------
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  v.action,
  v.module,
  v.description,
  f.id,
  now(),
  now()
FROM (
  VALUES
    ('attendance:check_in', 'attendance', 'Check-in attendance for current slot'),
    ('attendance:read',     'attendance', 'View attendance logs and summaries'),
    ('attendance:manage',   'attendance', 'Manage, override or edit attendance logs'),
    ('attendance_schedule:manage', 'attendance_schedule', 'Configure check-in schedules and slots')
) AS v(action, module, description)
CROSS JOIN (
  SELECT id FROM "feature" WHERE "code" = 'ATTENDANCE_MANAGEMENT' LIMIT 1
) f
ON CONFLICT ("action") DO UPDATE SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id" = EXCLUDED."feature_id",
  "updated_at" = now();

--> statement-breakpoint

-- ขั้นตอนที่ 3: Map Permissions สู่ System Default Roles (ตาราง "role_permission")
-- ----------------------------------------------------------------------------
-- 3.1 SUPER_ADMIN -> ได้รับสิทธิ์ทั้งหมดของโมดูล
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'SUPER_ADMIN' AND r.is_system_default = true
  AND p.module IN ('attendance', 'attendance_schedule')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.2 OWNER & ADMIN -> ได้รับสิทธิ์บริหารจัดการและอ่าน
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type IN ('OWNER', 'ADMIN') AND r.is_system_default = true
  AND p.module IN ('attendance', 'attendance_schedule')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.3 MEMBER -> ได้รับเฉพาะสิทธิ์ลงเวลาและดูข้อมูลของตนเอง
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'MEMBER' AND r.is_system_default = true
  AND p.action IN ('attendance:check_in', 'attendance:read')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- ขั้นตอนที่ 4: Backfill Company Entitlements (ตาราง "company_feature")
-- เปิดใช้งานฟีเจอร์นี้ให้กับทุกบริษัทที่มีอยู่ในระบบ (ถ้าเป็น Default Feature)
-- ----------------------------------------------------------------------------
INSERT INTO "company_feature" ("id", "company_id", "feature_id", "is_enabled", "created_at", "updated_at")
SELECT gen_random_uuid(), c.id, f.id, true, now(), now()
FROM "company" c
CROSS JOIN "feature" f
WHERE f.code = 'ATTENDANCE_MANAGEMENT' AND f.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM "company_feature" cf WHERE cf.company_id = c.id AND cf.feature_id = f.id
  );

--> statement-breakpoint

-- ขั้นตอนที่ 5: Delegate Feature สู่ Company Roles (ตาราง "role_feature" - ถ้าต้องการ)
-- กำหนดว่า Role ใดในบริษัทสามารถมองเห็นและเข้าถึง Feature นี้ได้
-- ----------------------------------------------------------------------------
INSERT INTO "role_feature" ("id", "company_id", "role_id", "feature_id", "is_enabled", "created_at", "updated_at")
SELECT gen_random_uuid(), r.company_id, r.id, f.id, true, now(), now()
FROM "role" r
CROSS JOIN "feature" f
WHERE f.code = 'ATTENDANCE_MANAGEMENT'
  AND r.role_type IN ('OWNER', 'ADMIN', 'MEMBER')
  AND r.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "role_feature" rf WHERE rf.role_id = r.id AND rf.feature_id = f.id
  );
```

---

### 2.3 Checklist ตรวจสอบก่อนรัน Migration
- [ ] ชื่อโฟลเดอร์ migration สื่อความหมายชัดเจน ไม่มี random name
- [ ] มี `--> statement-breakpoint` คั่นระหว่างคำสั่ง SQL ครบถ้วน
- [ ] ทุก `INSERT` มีกลไกป้องกันข้อมูลซ้ำ (`ON CONFLICT` หรือ `NOT EXISTS`)
- [ ] สิทธิ์ (Permissions) ผูกเข้ากับ `feature_id` ที่ถูกต้อง
- [ ] มีการ Map สิทธิ์ให้กับ System Default Roles (`SUPER_ADMIN`, `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`) อย่างเหมาะสม
- [ ] ทดสอบรัน migration ซ้ำ (Idempotency check) โดยไม่มี Error