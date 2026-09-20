import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from '@repo/database';
import { CheckInScheduleRepository } from '../src/repositories/attendance.repo';

// Explicit opt-in. Uses an isolated schema and drops only that schema afterwards.
test(
  'PostgreSQL migration preserves attendance and enforces M:N assignments atomically',
  { skip: process.env.ATTENDANCE_DB_TESTS !== '1' },
  async () => {
    const schema = `attendance_test_${randomUUID().replaceAll('-', '')}`;
    const client = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      options: `-c search_path=${schema}`,
    });
    const companyA = randomUUID(),
      companyB = randomUUID(),
      roleA = randomUUID(),
      roleB = randomUUID(),
      foreignRole = randomUUID(),
      globalRole = randomUUID(),
      scheduleId = randomUUID(),
      memberId = randomUUID(),
      slotId = randomUUID(),
      logId = randomUUID();
    await client.query('SELECT 1');
    try {
      await client.query(`CREATE SCHEMA "${schema}"`);
      await client.query(`SET search_path TO "${schema}"`);
      const migrationSql = await readFile(
        new URL(
          '../../database/migrations/20260919091959_initial_database/migration.sql',
          import.meta.url,
        ),
        'utf8',
      );
      for (const statement of migrationSql
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter(Boolean)) {
        await client.query(statement);
      }
      const userId = randomUUID();
      await client.query(
        'INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3)',
        [userId, 'Test User', 'test@example.com'],
      );
      await client.query(
        'INSERT INTO company (id, name, slug) VALUES ($1, $2, $3), ($4, $5, $6)',
        [companyA, 'Company A', 'comp-a', companyB, 'Company B', 'comp-b'],
      );
      await client.query(
        'INSERT INTO role (id, company_id, name, role_type, is_system_default) VALUES ($1,$2,$3,$4,false), ($5,$2,$6,$4,false), ($7,$8,$9,$4,false), ($10,NULL,$11,$12,true)',
        [
          roleA,
          companyA,
          'Role A',
          'CUSTOM',
          roleB,
          'Role B',
          foreignRole,
          companyB,
          'Role Foreign',
          globalRole,
          'Global Role',
          'SUPER_ADMIN',
        ],
      );
      await client.query(
        'INSERT INTO company_member (id, company_id, user_id) VALUES ($1, $2, $3)',
        [memberId, companyA, userId],
      );
      await client.query(
        "INSERT INTO check_in_schedules (id, company_id, name, is_active, updated_at) VALUES ($1,$2,'Existing',false,now())",
        [scheduleId, companyA],
      );
      await client.query(
        'INSERT INTO check_in_schedule_roles (id, company_id, check_in_schedule_id, role_id, updated_at) VALUES ($1,$2,$3,$4,now())',
        [randomUUID(), companyA, scheduleId, globalRole],
      );
      await client.query(
        "INSERT INTO schedule_slots (id,check_in_schedule_id,slot_order,label,window_start,window_end,updated_at) VALUES ($1,$2,1,'Morning','08:00','09:00',now())",
        [slotId, scheduleId],
      );
      await client.query(
        "INSERT INTO attendance_logs (id,company_member_id,schedule_slot_id,work_date,status,updated_at) VALUES ($1,$2,$3,'2026-09-12','present',now())",
        [logId, memberId, slotId],
      );
      assert.equal(
        (await client.query('SELECT id FROM attendance_logs')).rows[0].id,
        logId,
      );
      assert.equal(
        (await client.query('SELECT schedule_slot_id FROM attendance_logs'))
          .rows[0].schedule_slot_id,
        slotId,
      );
      const repo = new CheckInScheduleRepository(
        drizzle({ client, relations }),
      );
      const migrated = await repo.findById(scheduleId);
      assert.deepEqual(migrated?.roleIds, [globalRole]);
      assert.equal(migrated?.isActive, false);
      assert.equal((await repo.findByRoleId(companyA, roleA)).length, 0);
      await repo.update(scheduleId, {
        isActive: true,
        roleIds: [roleA, roleB],
      });
      const second = await repo.create({
        companyId: companyA,
        name: 'Evening',
        isActive: true,
        roleIds: [roleA],
      });
      assert.equal((await repo.findByRoleId(companyA, roleA)).length, 2);
      assert.equal((await repo.findByRoleId(companyA, roleB)).length, 1);
      assert.equal((await repo.findByRoleId(companyB, roleA)).length, 0);
      const assignmentId = (
        await client.query(
          'SELECT id FROM check_in_schedule_roles WHERE check_in_schedule_id=$1 AND role_id=$2',
          [scheduleId, roleA],
        )
      ).rows[0].id;
      await repo.update(scheduleId, { roleIds: [roleB] });
      assert.deepEqual(
        (await repo.findByRoleId(companyA, roleA)).map(
          (schedule) => schedule.id,
        ),
        [second.id],
      );
      await repo.update(scheduleId, { roleIds: [roleA, roleB] });
      assert.equal(
        (
          await client.query(
            'SELECT id FROM check_in_schedule_roles WHERE check_in_schedule_id=$1 AND role_id=$2',
            [scheduleId, roleA],
          )
        ).rows[0].id,
        assignmentId,
      );
      await assert.rejects(
        repo.update(scheduleId, {
          name: 'Must roll back',
          roleIds: [randomUUID()],
        }),
      );
      assert.equal((await repo.findById(scheduleId))?.name, 'Existing');
      assert.equal((await repo.findById(scheduleId))?.roleIds.length, 2);
      await assert.rejects(
        repo.create({
          companyId: companyA,
          name: 'Invalid duplicate',
          isActive: true,
          roleIds: [roleA, roleA],
        }),
      );
      assert.equal((await repo.findByCompanyId(companyA)).length, 2);
      await assert.rejects(
        client.query(
          'INSERT INTO check_in_schedule_roles (id,company_id,check_in_schedule_id,role_id,updated_at) VALUES ($1,$2,$3,$4,now())',
          [randomUUID(), companyB, scheduleId, foreignRole],
        ),
      );
      await assert.rejects(repo.delete(scheduleId)); // Existing logs restrict deleting slots.
      await repo.update(scheduleId, { roleIds: [] });
      assert.equal(
        (
          await client.query(
            'SELECT count(*)::int AS count FROM attendance_logs',
          )
        ).rows[0].count,
        1,
      );
    } finally {
      await client.query('SET search_path TO public');
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await client.end();
    }
  },
);
