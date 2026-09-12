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
      await client.query(
        'CREATE TABLE company (id uuid PRIMARY KEY); CREATE TABLE "user" (id uuid PRIMARY KEY); CREATE TABLE company_member (id uuid PRIMARY KEY); CREATE TABLE role (id uuid PRIMARY KEY, company_id uuid, is_system_default boolean NOT NULL DEFAULT false);',
      );
      const original = await readFile(
        new URL(
          '../../database/drizzle/20260906054008_add_attendance_and_leave_modules/migration.sql',
          import.meta.url,
        ),
        'utf8',
      );
      await client.query(original);
      await client.query('INSERT INTO company VALUES ($1), ($2)', [
        companyA,
        companyB,
      ]);
      await client.query(
        'INSERT INTO role (id,company_id) VALUES ($1,$2), ($3,$2), ($4,$5), ($6,NULL)',
        [roleA, companyA, roleB, foreignRole, companyB, globalRole],
      );
      await client.query('INSERT INTO company_member VALUES ($1)', [memberId]);
      await client.query(
        "INSERT INTO check_in_schedules (id, company_id, role_id, name, is_active, updated_at) VALUES ($1,$2,$3,'Existing',false,now())",
        [scheduleId, companyA, roleA],
      );
      await client.query(
        "INSERT INTO schedule_slots (id,check_in_schedule_id,slot_order,label,window_start,window_end,updated_at) VALUES ($1,$2,1,'Morning','08:00','09:00',now())",
        [slotId, scheduleId],
      );
      await client.query(
        "INSERT INTO attendance_logs (id,company_member_id,schedule_slot_id,work_date,status,updated_at) VALUES ($1,$2,$3,'2026-09-12','present',now())",
        [logId, memberId, slotId],
      );
      const migration = await readFile(
        new URL(
          '../../database/drizzle/20260912040000_check_in_schedule_roles/migration.sql',
          import.meta.url,
        ),
        'utf8',
      );
      // A foreign-company legacy role must stop the migration without partial changes.
      await client.query('UPDATE check_in_schedules SET role_id=$1', [
        foreignRole,
      ]);
      await client.query('BEGIN');
      await assert.rejects(
        client.query(migration),
        /company roles or system default roles/,
      );
      await client.query('ROLLBACK');
      await client.query('UPDATE role SET is_system_default=true WHERE id=$1', [
        globalRole,
      ]);
      await client.query('UPDATE check_in_schedules SET role_id=$1', [
        globalRole,
      ]);
      await client.query('BEGIN');
      await client.query(migration);
      await client.query('COMMIT');
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
