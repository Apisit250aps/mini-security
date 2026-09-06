ALTER TABLE "attendance_checkpoint" DROP CONSTRAINT "attendance_checkpoint_policy_id_attendance_policy_id_fkey";--> statement-breakpoint
ALTER TABLE "attendance_log" DROP CONSTRAINT "attendance_log_attendance_record_id_attendance_record_id_fkey";--> statement-breakpoint
ALTER TABLE "attendance_log" DROP CONSTRAINT "attendance_log_checkpoint_id_attendance_checkpoint_id_fkey";--> statement-breakpoint
ALTER TABLE "attendance_log" DROP CONSTRAINT "attendance_log_location_id_attendance_location_id_fkey";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP CONSTRAINT "attendance_record_work_shift_id_work_shift_id_fkey";--> statement-breakpoint
ALTER TABLE "checkpoint_location" DROP CONSTRAINT "checkpoint_location_checkpoint_id_attendance_checkpoint_id_fkey";--> statement-breakpoint
ALTER TABLE "checkpoint_location" DROP CONSTRAINT "checkpoint_location_location_id_attendance_location_id_fkey";--> statement-breakpoint
ALTER TABLE "role_attendance_policy" DROP CONSTRAINT "role_attendance_policy_policy_id_attendance_policy_id_fkey";--> statement-breakpoint
ALTER TABLE "role_work_schedule" DROP CONSTRAINT "role_work_schedule_work_shift_id_work_shift_id_fkey";--> statement-breakpoint
ALTER TABLE "work_shift" DROP CONSTRAINT "work_shift_work_schedule_id_work_schedule_id_fkey";--> statement-breakpoint
DROP TABLE "attendance_checkpoint";--> statement-breakpoint
DROP TABLE "attendance_location";--> statement-breakpoint
DROP TABLE "attendance_log";--> statement-breakpoint
DROP TABLE "attendance_policy";--> statement-breakpoint
DROP TABLE "attendance_record";--> statement-breakpoint
DROP TABLE "checkpoint_location";--> statement-breakpoint
DROP TABLE "leave_request";--> statement-breakpoint
DROP TABLE "role_attendance_policy";--> statement-breakpoint
DROP TABLE "role_work_schedule";--> statement-breakpoint
DROP TABLE "work_schedule";--> statement-breakpoint
DROP TABLE "work_shift";--> statement-breakpoint
DROP TYPE "attendance_status";--> statement-breakpoint
DROP TYPE "check_type";--> statement-breakpoint
DROP TYPE "leave_status";--> statement-breakpoint
DROP TYPE "leave_type";--> statement-breakpoint
DROP TYPE "location_type";