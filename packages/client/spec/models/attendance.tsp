namespace MiniSecurity;

// ─── CheckInSchedule ─────────────────────────────────────────────────────────
model CheckInSchedule is Domain.Entity.CheckInSchedule;

model CreateCheckInSchedule
  is OmitProperties<CheckInSchedule, "id" | "createdAt" | "updatedAt">;

model UpdateCheckInSchedule
  is OptionalProperties<OmitProperties<CheckInSchedule, "id" | "companyId" | "createdAt" | "updatedAt">>;

// ─── ScheduleSlot ────────────────────────────────────────────────────────────
model ScheduleSlot is Domain.Entity.ScheduleSlot;

model CreateScheduleSlot
  is OmitProperties<ScheduleSlot, "id" | "checkInScheduleId" | "createdAt" | "updatedAt">;

model UpdateScheduleSlot
  is OptionalProperties<OmitProperties<ScheduleSlot, "id" | "checkInScheduleId" | "createdAt" | "updatedAt">>;

// ─── AttendanceLog ───────────────────────────────────────────────────────────
model AttendanceLog is Domain.Entity.AttendanceLog;

model CreateAttendanceLog
  is OmitProperties<AttendanceLog, "id" | "createdAt" | "updatedAt">;

model UpdateAttendanceLog
  is OptionalProperties<OmitProperties<AttendanceLog, "id" | "createdAt" | "updatedAt">>;

model CheckInRequest {
  companyMemberId: string;
  scheduleSlotId: string;
  note?: string;
}
