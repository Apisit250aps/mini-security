# Forms — แผนพัฒนา backend ถึง frontend

แผนลงมือและ checklist สำหรับติดตามงาน: [.plans/form-workflow-implementation.md](../../../.plans/form-workflow-implementation.md)

อ้างอิงโครงสร้างล่าสุด: [ERD (DBML)](../erDiagram.dbml) และ [คำอธิบาย ERD ภาษาไทย](erd-description-th.md) — แบบเสนอ ยังไม่ใช่ runtime schema

สถานะ: **Proposed — 2026-09-15** งานรอบนี้เขียนเอกสารเท่านั้น ไม่มี migration/reset/runtime change

อ่าน [feature/data design](form-workflow-design.md) และ [UI/data flow](form-workflow-ui-flow.md) เป็นข้อกำหนดร่วม

## 1. Baseline ที่ตรวจจาก repository

| Layer          | ตำแหน่งจริงและสิ่งที่มี                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Domain         | packages/domains/src/schema/form.ts, entities/form, repositories/form, applications/form: schema-first Zod และ contracts   |
| Database       | packages/database/src/schema/form.ts, relations/form.relations.ts: Drizzle และ shared repository                           |
| Application    | packages/applications/src/use-cases/form/: template, field/section, submission และ review use cases                        |
| Infrastructure | packages/infrastructures/src/repositories/form.repo.ts และ compositions/applications/form/form.usecase.ts: repository + DI |
| API            | apps/api/src/controllers/form.controller.ts, routes/form.route.ts: Hono authenticated routes                               |
| API contract   | packages/client/spec/models/form.tsp, services/form.tsp → generated @repo/client                                           |
| Frontend       | apps/web/src/modules/form/{views,components,hooks}; Next routes ภายใต้ /organization/forms                                 |

ปัจจุบัน start submission หา shared draft ด้วย Role + template และ review ยังบังคับ OWNER หลังตรวจ permission มี UI role dialog และ review ทั้งชุด แบบใหม่นี้แทนกติกาเหล่านั้น ไม่ใช่เพิ่ม assignment แล้วปล่อย authorization เดิมค้างอยู่

ใช้ skills clean-architecture-feature และ frontend-architecture เป็นแนวทาง แต่ยึด API/DI paths จริงข้างต้นแทนตัวอย่างเก่าใน skill ที่วาง API ใน apps/web

## 2. ลำดับพัฒนาและผลส่งมอบ

### Phase 1 — Domain design และ constraints

- Proposed DBML และคำอธิบายไทยอัปเดต/parse ผ่านแล้วในงานเอกสาร; ก่อน implementation ทบทวน constraints และประกอบ partial indexes ตาม ERD description
- ระบุตารางใหม่ 6 ตารางรวม explicit periods, supersedes plan config, assignment replacement และ review target constraints
- ตัด form_template_role/review เดิมจากแบบใหม่เมื่อไม่มีหน้าที่อื่น และไล่ทุก reference ก่อนตัด runtime
- สร้าง Zod base schemas แล้ว derive create/update ก่อน refine (Zod 4); export entity types/classes, repository interfaces และ use-case contracts ตาม module เดิม
- แยก read DTO เช่น list summary, assignment detail, review coverage จาก persistent entity; ไม่เพิ่ม derived columns เพื่อเอาใจ UI
- สรุป permission catalog/action codes และ mapping existing permission → new actions สำหรับ seed พัฒนา ไม่สร้าง Owner-only check ใหม่

**เสร็จเมื่อ:** DBML parse ผ่าน, source-only audit ครบ, business invariants มีเจ้าของใน DB/use case ชัดเจน

### Phase 2 — Database และ repositories

- Drizzle schemas, centralized relations, composite tenant FKs, XOR checks, indexes และ unique constraints สำหรับ occurrences, assignments, revision roots/successors, review heads/final decision
- ต่อ repository base เดิม; custom queries สำหรับ list pagination, active schedule configs, latest submission/review และ derived summaries
- เตรียม fresh migration/seed สำหรับ DB พัฒนา ตรวจชื่อ DB/host ก่อน run; reset เฉพาะ dev dataset ที่ระบุชัด ไม่แตะ production
- ไม่แต่ง historical inputs ให้ข้อมูลเก่า หากต้องรักษาข้อมูลจริงต้องออก migration strategy แยกก่อน
- Attachment retention ต้องคง object ที่มี reference จาก revision ก่อนหน้า

**เสร็จเมื่อ:** migration บน disposable DB ผ่าน, FK/unique/check และ rollback transaction ตรวจได้จริง

### Phase 3 — Plans และ scheduler

Use cases: Create/UpdatePlan, Activate/PausePlan, PreviewSchedule, List/GetPlan, OpenDueOccurrences, CancelOccurrence, Cancel/ReplaceAssignment

- ใช้ schema.safeParseAsync, typed errors, constructor DI, RequirePermission และ resource resolver ตามรูปแบบเดิม
- ทุก multi-write อยู่ IUnitOfWork; เปิดรอบกับแก้แผน serialize ที่ config เดียวกัน
- แยก pure schedule calculator จาก worker adapter; inject clock สำหรับทดสอบ ห้ามผูก scheduler กับการเปิดหน้าเว็บ
- Preview และ worker เรียก calculator เดียวกัน; จัดการ timezone/calendar boundaries และ batch catch-up
- Wire composition ใน infrastructures; worker entry point เรียก application contract ไม่ query DB ข้ามชั้นเอง
- ทำ retry/idempotency และ operational error visibility; ไม่เพิ่ม persistent next-run/status cache

**เสร็จเมื่อ:** daily/weekly/monthly/quarterly/yearly/explicit, pause/resume, missed-run, duplicate worker และ target expansion ถูกต้อง

### Phase 4 — Assignment และ submission

Use cases: ListMyAssignments, GetAssignment, StartAssignmentSubmission, SaveDraft, Submit, CreateCorrection

- actor มาจาก auth context; resolve assignment → organization/version/policy จาก DB
- เปลี่ยน draft lookup เป็น assignment; ตรวจ permission + recipient scope ไม่ใช้ creator/Owner แทน
- รักษา concurrency token, revision chain, contributor lineage และ immutability หลัง submit
- reuse upload infrastructure ที่มีจริง ตรวจ protocol/authorization ก่อนต่อ UI ไม่สร้าง mock upload แทน integration
- review NONE ปิดงานโดย derive; modes อื่นรอ final review

**เสร็จเมื่อ:** Role shared และ member แยกกัน, race start/clone ปลอด duplicate, upload/submit/revision history ทำงานจริง

### Phase 5 — Permission-based review

Use cases: ListReviewQueue, GetReviewDetail, RecordAnswerReview, RecordSectionReview, FinalizeSubmissionReview

- ยกเลิก role_type OWNER restriction; ใช้ permissions ปัจจุบัน + tenant + self-review rule
- Review entry append-only, target/version validation, note required สำหรับ NEEDS_CHANGES/RETURN
- Finalize transaction ตรวจ latest heads/coverage และ unique final result; concurrent review/finalize ต้องไม่ทะลุ
- Read models คำนวณ status, pending corrections, coverage และ history ไม่เก็บซ้ำ

**เสร็จเมื่อ:** non-Owner ที่มีสิทธิ์ตรวจได้, Owner ที่ไม่มีสิทธิ์ตรวจไม่ได้, image correction และ section correction ผ่านครบ revision flow

### Phase 6 — API contracts และ integration

ทำ TypeSpec/SDK ควบคู่แต่ละ vertical slice ก่อน frontend ใช้ ไม่รอสร้าง API ทุกอย่างจบทีเดียว

| กลุ่ม endpoint เสนอภายใต้ /forms                   | ข้อมูลสำคัญ                                                |
| -------------------------------------------------- | ---------------------------------------------------------- |
| GET templates/organization list, GET template      | pagination/filter + detail; ต่อ naming เดิมใน routes/spec  |
| GET/POST templates/:id/plans                       | plan list/create                                           |
| GET/PUT plans/:id                                  | detail/update พร้อม expectedRevision                       |
| POST plans/:id/activate, pause                     | explicit lifecycle commands                                |
| POST templates/:id/schedule-preview                | validated unsaved config → preview; read-only แม้เป็น POST |
| GET templates/:id/occurrences, GET occurrences/:id | summaries + actual policy/assignments                      |
| POST occurrences/:id/cancel                        | reason + expectedRevision                                  |
| GET assignments, GET assignments/:id               | mine/manager filters และ resource-scoped read              |
| POST assignments/:id/start                         | คืน existing/new draft แบบ idempotent                      |
| POST assignments/:id/cancel, replace               | explicit reason/target; preserve history                   |
| PUT submissions/:id/draft, POST submit, correction | expectedRevision, answer inputs; ไม่รับ trusted actor      |
| GET review-queue, GET submissions/:id/review       | permission-filtered list/detail                            |
| POST submissions/:id/review-entries                | target/action/note/expectedRevision/expectedHeadId         |
| POST submissions/:id/finalize                      | APPROVE/RETURN/note/expectedRevision                       |

ใช้ controllers/routes ใน apps/api, shared response envelope/error mapping เดิม และ TypeSpec models alias domain entities; request DTO ตัด actor/organization ที่ server ต้อง resolve ไม่เชื่อ payload

เพิ่ม pagination metadata และ available actions ใน read DTO ตามความจำเป็น Generate domain entities → TypeSpec → OpenAPI/SDK ด้วย scripts ของ packages จริง ตรวจ diff ว่าไม่มี generated files อื่นหาย

**เสร็จเมื่อ:** authenticated API integration ผ่านทั้ง positive/negative cases และ generated client ตรง HTTP responses

### Phase 7 — Frontend vertical flows

1. ตาราง Form → detail layout/tabs → settings/builder; ย้าย long edit/config ออกจาก row modal
2. Plan list/detail/editor/preview/activation; local form state + server schedule preview
3. Occurrence list/detail/assignment monitoring และ cancellation
4. My tasks → assignment → filler/upload/submit/correction
5. Review queue → answer/section notes → final decision/history
6. เพิ่ม page config/nav ภายใน Forms เดิม และ Role permission labels ในหน้าสิทธิ์เดิม

ใช้ PageLayout, shared fields/data table, module-owned components, @repo/client, React Query keys ที่มี tenant และ mutation invalidation ตาม UI doc ทุก step ต้องมี loading/error/empty/403/409 ไม่ hardcode success จาก mock

**เสร็จเมื่อ:** routes เปิดตรงได้, browser back/filter state ถูกต้อง, desktop/mobile controls ใช้งานได้ และ user walkthrough ผ่าน

## 3. Verification matrix

| กลุ่ม         | หลักฐานที่ต้องมีตอน implement                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schedule      | month 31, leap year, quarterly anchor, timezone/DST, explicit overlap, pause/resume, edit effective boundary                                            |
| Worker        | retry เดิมไม่ซ้ำ, concurrent workers, crash rollback, catch-up ใช้ config เดิม, empty recipients                                                        |
| Authorization | cross-tenant IDs, spoof actor, inactive member, Role membership change, permission revoked, non-Owner permission, self-review lineage                   |
| Submission    | shared draft collision, start/clone race, required/enum validation, failed upload, late submit/correction, immutable historical image                   |
| Review        | target ต่าง revision, note ว่าง, mixed section/item reject, insufficient coverage, two finalizers, review vs finalize race, no automatic PASS carry     |
| Frontend      | table→detail, deep links, tenant switch, dirty navigation, API error ≠ empty, invalidations, 409 recovery, permission UI, mobile image capture fallback |
| End-to-end    | create→publish→plan→worker→assignment→photo→return with comment→correction→approve รวม review NONE                                                      |

Run targeted domain/application/database tests ที่พิสูจน์ invariants จากนั้น TypeScript/lint ของ packages ที่เปลี่ยน และ authenticated API/browser checks ตาม scope; static checks ไม่ใช่หลักฐาน runtime readiness

## 4. Scope และ dependency gates

- Docs รอบนี้ไม่รัน migrate/reset/generate client หรือเขียน runtime tests เพราะไม่มี runtime edit
- ก่อนเปิดใช้ scheduler จริงต้องมี constraints/idempotency และ integration test ผ่าน
- ก่อน frontend review ต้องมี contract/permission/read DTO จริง
- Notification, threaded comments, AI blur detection, multi-stage approval, per-section assignee และ arbitrary workflow DSL เป็นงานถัดไป
- ไม่เพิ่ม due-date amendment table ในรุ่นแรก: ถ้าต้องส่งแก้หลัง deadline ที่ late DENY ใช้ยกเลิกและเปิดรอบใหม่ที่มีเวลาใหม่อย่างชัดเจน (replacement ในรอบเดิมไม่เปลี่ยน due); หากผลิตภัณฑ์ต้องการต่อเวลาในงานเดิมให้เพิ่ม append-only amendment design ก่อนลงมือ
- แผนนี้ยอมเปลี่ยน flow และ reset dev schema ได้ตามบริบทพัฒนา ไม่บังคับ compatibility ของ prototype เดิม
