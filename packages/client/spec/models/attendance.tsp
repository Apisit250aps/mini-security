namespace MiniSecurity;

// ─── Work Schedule & Shift ──────────────────────────────────────────────────
model WorkSchedule is Domain.Entity.WorkSchedule;
model CreateWorkSchedule is OmitProperties<WorkSchedule, "id" | "createdAt" | "updatedAt">;
model UpdateWorkSchedule is OptionalProperties<OmitProperties<WorkSchedule, "id" | "createdAt" | "updatedAt">>;

model WorkShift is Domain.Entity.WorkShift;
model CreateWorkShift is OmitProperties<WorkShift, "id" | "createdAt" | "updatedAt">;
model UpdateWorkShift is OptionalProperties<OmitProperties<WorkShift, "id" | "createdAt" | "updatedAt">>;

// ─── Attendance Policy & Checkpoint ──────────────────────────────────────────
model AttendancePolicy is Domain.Entity.AttendancePolicy;
model CreateAttendancePolicy is OmitProperties<AttendancePolicy, "id" | "createdAt" | "updatedAt">;
model UpdateAttendancePolicy is OptionalProperties<OmitProperties<AttendancePolicy, "id" | "createdAt" | "updatedAt">>;

model AttendanceCheckpoint is Domain.Entity.AttendanceCheckpoint;
model CreateAttendanceCheckpoint is OmitProperties<AttendanceCheckpoint, "id" | "createdAt" | "updatedAt">;
model UpdateAttendanceCheckpoint is OptionalProperties<OmitProperties<AttendanceCheckpoint, "id" | "createdAt" | "updatedAt">>;

model RoleAttendancePolicy is Domain.Entity.RoleAttendancePolicy;
model CreateRoleAttendancePolicy is OmitProperties<RoleAttendancePolicy, "id" | "createdAt" | "updatedAt">;
model UpdateRoleAttendancePolicy is OptionalProperties<OmitProperties<RoleAttendancePolicy, "id" | "createdAt" | "updatedAt">>;

// ─── Attendance Location ────────────────────────────────────────────────────
model AttendanceLocation is Domain.Entity.AttendanceLocation;
model CreateAttendanceLocation is OmitProperties<AttendanceLocation, "id" | "createdAt" | "updatedAt">;
model UpdateAttendanceLocation is OptionalProperties<OmitProperties<AttendanceLocation, "id" | "createdAt" | "updatedAt">>;

model CheckpointLocation is Domain.Entity.CheckpointLocation;
model CreateCheckpointLocation is OmitProperties<CheckpointLocation, "id" | "createdAt" | "updatedAt">;
model UpdateCheckpointLocation is OptionalProperties<OmitProperties<CheckpointLocation, "id" | "createdAt" | "updatedAt">>;

// ─── Role Work Schedule ────────────────────────────────────────────────────
model RoleWorkSchedule is Domain.Entity.RoleWorkSchedule;
model CreateRoleWorkSchedule is OmitProperties<RoleWorkSchedule, "id" | "createdAt" | "updatedAt">;
model UpdateRoleWorkSchedule is OptionalProperties<OmitProperties<RoleWorkSchedule, "id" | "createdAt" | "updatedAt">>;

// ─── Attendance Record & Log ─────────────────────────────────────────────────
model AttendanceRecord is Domain.Entity.AttendanceRecord;
model CreateAttendanceRecord is OmitProperties<AttendanceRecord, "id" | "createdAt" | "updatedAt">;
model UpdateAttendanceRecord is OptionalProperties<OmitProperties<AttendanceRecord, "id" | "createdAt" | "updatedAt">>;

model AttendanceLog is Domain.Entity.AttendanceLog;
model CreateAttendanceLog is OmitProperties<AttendanceLog, "id" | "createdAt" | "updatedAt">;
model UpdateAttendanceLog is OptionalProperties<OmitProperties<AttendanceLog, "id" | "createdAt" | "updatedAt">>;

// ─── Leave Request ───────────────────────────────────────────────────────────
model LeaveRequest is Domain.Entity.LeaveRequest;
model CreateLeaveRequest is OmitProperties<LeaveRequest, "id" | "createdAt" | "updatedAt">;
model UpdateLeaveRequest is OptionalProperties<OmitProperties<LeaveRequest, "id" | "createdAt" | "updatedAt">>;

model ApproveAttendanceRecordRequest {
  status: Domain.Entity.AttendanceStatus;
  note?: string;
}

model ReviewLeaveRequest {
  status: Domain.Entity.LeaveStatus;
  reviewNote?: string;
}
