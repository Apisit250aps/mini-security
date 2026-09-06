namespace MiniSecurity;

// ─── LeaveType ───────────────────────────────────────────────────────────────
model LeaveType is Domain.Entity.LeaveType;

model CreateLeaveType
  is OmitProperties<LeaveType, "id" | "createdAt" | "updatedAt">;

model UpdateLeaveType
  is OptionalProperties<OmitProperties<LeaveType, "id" | "createdAt" | "updatedAt">>;

// ─── LeaveQuota ──────────────────────────────────────────────────────────────
model LeaveQuota is Domain.Entity.LeaveQuota;

model CreateLeaveQuota
  is OmitProperties<LeaveQuota, "id" | "createdAt" | "updatedAt">;

model UpdateLeaveQuota
  is OptionalProperties<OmitProperties<LeaveQuota, "id" | "createdAt" | "updatedAt">>;

// ─── LeaveRequest ────────────────────────────────────────────────────────────
model LeaveRequest is Domain.Entity.LeaveRequest;

model CreateLeaveRequest
  is OmitProperties<LeaveRequest, "id" | "createdAt" | "updatedAt" | "status" | "reviewedBy" | "reviewedAt" | "reviewNote">;

model ReviewLeaveRequestRequest {
  action: "approved" | "rejected";
  reviewNote?: string;
}
