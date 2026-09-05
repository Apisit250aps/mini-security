import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/attendance")
@tag("Attendance")
interface AttendanceServices {
  // ─── Work Schedules ─────────────────────────────────────────────────────────
  @get
  @route("/companies/{companyId}/schedules")
  @summary("Get work schedules by company")
  getWorkSchedules(@path companyId: string):
    | ApiOkResponse<WorkSchedule[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/schedules/{id}")
  @summary("Get work schedule by ID")
  getWorkSchedule(@path id: string):
    | ApiOkResponse<WorkSchedule>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/schedules")
  @summary("Create work schedule")
  createWorkSchedule(@body body: CreateWorkSchedule):
    | ApiCreatedResponse<WorkSchedule>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/schedules/{id}")
  @summary("Update work schedule")
  updateWorkSchedule(@path id: string, @body body: UpdateWorkSchedule):
    | ApiOkResponse<WorkSchedule>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/schedules/{id}")
  @summary("Delete work schedule")
  deleteWorkSchedule(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Work Shifts ────────────────────────────────────────────────────────────
  @get
  @route("/companies/{companyId}/shifts")
  @summary("Get work shifts by company")
  getCompanyWorkShifts(@path companyId: string):
    | ApiOkResponse<WorkShift[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/schedules/{workScheduleId}/shifts")
  @summary("Get work shifts by schedule")
  getWorkShifts(@path workScheduleId: string):
    | ApiOkResponse<WorkShift[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/shifts/{id}")
  @summary("Get work shift by ID")
  getWorkShift(@path id: string):
    | ApiOkResponse<WorkShift>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/shifts")
  @summary("Create work shift")
  createWorkShift(@body body: CreateWorkShift):
    | ApiCreatedResponse<WorkShift>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/shifts/{id}")
  @summary("Update work shift")
  updateWorkShift(@path id: string, @body body: UpdateWorkShift):
    | ApiOkResponse<WorkShift>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/shifts/{id}")
  @summary("Delete work shift")
  deleteWorkShift(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Attendance Policies ───────────────────────────────────────────────────
  @get
  @route("/companies/{companyId}/policies")
  @summary("Get attendance policies by company")
  getAttendancePolicies(@path companyId: string):
    | ApiOkResponse<AttendancePolicy[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/policies/{id}")
  @summary("Get attendance policy by ID")
  getAttendancePolicy(@path id: string):
    | ApiOkResponse<AttendancePolicy>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/policies")
  @summary("Create attendance policy")
  createAttendancePolicy(@body body: CreateAttendancePolicy):
    | ApiCreatedResponse<AttendancePolicy>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/policies/{id}")
  @summary("Update attendance policy")
  updateAttendancePolicy(@path id: string, @body body: UpdateAttendancePolicy):
    | ApiOkResponse<AttendancePolicy>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/policies/{id}")
  @summary("Delete attendance policy")
  deleteAttendancePolicy(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Attendance Checkpoints ─────────────────────────────────────────────────
  @get
  @route("/policies/{policyId}/checkpoints")
  @summary("Get checkpoints by policy")
  getAttendanceCheckpoints(@path policyId: string):
    | ApiOkResponse<AttendanceCheckpoint[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/checkpoints/{id}")
  @summary("Get checkpoint by ID")
  getAttendanceCheckpoint(@path id: string):
    | ApiOkResponse<AttendanceCheckpoint>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/checkpoints")
  @summary("Create checkpoint")
  createAttendanceCheckpoint(@body body: CreateAttendanceCheckpoint):
    | ApiCreatedResponse<AttendanceCheckpoint>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/checkpoints/{id}")
  @summary("Update checkpoint")
  updateAttendanceCheckpoint(@path id: string, @body body: UpdateAttendanceCheckpoint):
    | ApiOkResponse<AttendanceCheckpoint>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/checkpoints/{id}")
  @summary("Delete checkpoint")
  deleteAttendanceCheckpoint(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Role Attendance Policies ───────────────────────────────────────────────
  @get
  @route("/roles/{roleId}/policies")
  @summary("Get attendance policies for role")
  getRoleAttendancePolicies(@path roleId: string):
    | ApiOkResponse<RoleAttendancePolicy[]>
    | ApiUnauthorizedResponse;

  @post
  @route("/role-policies")
  @summary("Assign attendance policy to role")
  assignRoleAttendancePolicy(@body body: CreateRoleAttendancePolicy):
    | ApiCreatedResponse<RoleAttendancePolicy>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/roles/{roleId}/policies/{policyId}")
  @summary("Remove attendance policy from role")
  removeRoleAttendancePolicy(@path roleId: string, @path policyId: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Attendance Locations ──────────────────────────────────────────────────
  @get
  @route("/companies/{companyId}/locations")
  @summary("Get attendance locations by company")
  getAttendanceLocations(@path companyId: string):
    | ApiOkResponse<AttendanceLocation[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/locations/{id}")
  @summary("Get attendance location by ID")
  getAttendanceLocation(@path id: string):
    | ApiOkResponse<AttendanceLocation>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/locations")
  @summary("Create attendance location")
  createAttendanceLocation(@body body: CreateAttendanceLocation):
    | ApiCreatedResponse<AttendanceLocation>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/locations/{id}")
  @summary("Update attendance location")
  updateAttendanceLocation(@path id: string, @body body: UpdateAttendanceLocation):
    | ApiOkResponse<AttendanceLocation>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/locations/{id}")
  @summary("Delete attendance location")
  deleteAttendanceLocation(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Checkpoint Locations ──────────────────────────────────────────────────
  @get
  @route("/checkpoints/{checkpointId}/locations")
  @summary("Get locations assigned to checkpoint")
  getCheckpointLocations(@path checkpointId: string):
    | ApiOkResponse<CheckpointLocation[]>
    | ApiUnauthorizedResponse;

  @post
  @route("/checkpoint-locations")
  @summary("Assign location to checkpoint")
  assignCheckpointLocation(@body body: CreateCheckpointLocation):
    | ApiCreatedResponse<CheckpointLocation>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/checkpoints/{checkpointId}/locations/{locationId}")
  @summary("Remove location from checkpoint")
  removeCheckpointLocation(@path checkpointId: string, @path locationId: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Role Work Schedules ───────────────────────────────────────────────────
  @get
  @route("/companies/{companyId}/role-schedules")
  @summary("Get role work schedules by company")
  getRoleWorkSchedulesByCompany(@path companyId: string):
    | ApiOkResponse<RoleWorkSchedule[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/roles/{roleId}/schedules/current")
  @summary("Get current active schedule for role")
  getCurrentRoleWorkSchedule(@path roleId: string):
    | ApiOkResponse<RoleWorkSchedule>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/role-schedules")
  @summary("Assign schedule to role")
  assignRoleWorkSchedule(@body body: CreateRoleWorkSchedule):
    | ApiCreatedResponse<RoleWorkSchedule>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/role-schedules/{id}")
  @summary("Update role work schedule")
  updateRoleWorkSchedule(@path id: string, @body body: UpdateRoleWorkSchedule):
    | ApiOkResponse<RoleWorkSchedule>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/role-schedules/{id}")
  @summary("Delete role work schedule")
  deleteRoleWorkSchedule(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Attendance Records ────────────────────────────────────────────────────
  @get
  @route("/records")
  @summary("List attendance records")
  getAttendanceRecords(
    @query companyId: string,
    @query memberId?: string,
    @query startDate?: string,
    @query endDate?: string,
  ): ApiOkResponse<AttendanceRecord[]> | ApiUnauthorizedResponse;

  @get
  @route("/records/by-member-date")
  @summary("Get attendance record by member and date")
  getMemberAttendanceRecordByDate(
    @query companyMemberId: string,
    @query workDate: string,
  ): ApiOkResponse<AttendanceRecord> | ApiNotFoundResponse | ApiUnauthorizedResponse;

  @get
  @route("/records/{id}")
  @summary("Get attendance record by ID")
  getAttendanceRecord(@path id: string):
    | ApiOkResponse<AttendanceRecord>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/records")
  @summary("Create daily attendance record")
  createAttendanceRecord(@body body: CreateAttendanceRecord):
    | ApiCreatedResponse<AttendanceRecord>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/records/{id}")
  @summary("Update attendance record")
  updateAttendanceRecord(@path id: string, @body body: UpdateAttendanceRecord):
    | ApiOkResponse<AttendanceRecord>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/records/{id}")
  @summary("Delete attendance record")
  deleteAttendanceRecord(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/records/{id}/approve")
  @summary("Approve or reject attendance record")
  approveAttendanceRecord(
    @path id: string,
    @body body: ApproveAttendanceRecordRequest,
  ): ApiOkResponse<AttendanceRecord> | ApiNotFoundResponse | ApiUnauthorizedResponse;

  // ─── Attendance Logs ───────────────────────────────────────────────────────
  @get
  @route("/records/{attendanceRecordId}/logs")
  @summary("Get check-in logs by attendance record")
  getAttendanceLogsByRecord(@path attendanceRecordId: string):
    | ApiOkResponse<AttendanceLog[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/logs/{id}")
  @summary("Get attendance log by ID")
  getAttendanceLog(@path id: string):
    | ApiOkResponse<AttendanceLog>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/logs")
  @summary("Record check-in log event")
  createAttendanceLog(@body body: CreateAttendanceLog):
    | ApiCreatedResponse<AttendanceLog>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/logs/{id}")
  @summary("Update attendance log")
  updateAttendanceLog(@path id: string, @body body: UpdateAttendanceLog):
    | ApiOkResponse<AttendanceLog>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/logs/{id}")
  @summary("Delete attendance log")
  deleteAttendanceLog(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Leave Requests ────────────────────────────────────────────────────────
  @get
  @route("/leave-requests")
  @summary("Get leave requests")
  getLeaveRequests(
    @query companyId: string,
    @query memberId?: string,
    @query status?: LeaveRequest.status,
  ): ApiOkResponse<LeaveRequest[]> | ApiUnauthorizedResponse;

  @get
  @route("/leave-requests/{id}")
  @summary("Get leave request by ID")
  getLeaveRequest(@path id: string):
    | ApiOkResponse<LeaveRequest>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/leave-requests")
  @summary("Create leave request")
  createLeaveRequest(@body body: CreateLeaveRequest):
    | ApiCreatedResponse<LeaveRequest>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/leave-requests/{id}")
  @summary("Update leave request")
  updateLeaveRequest(@path id: string, @body body: UpdateLeaveRequest):
    | ApiOkResponse<LeaveRequest>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/leave-requests/{id}")
  @summary("Delete leave request")
  deleteLeaveRequest(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/leave-requests/{id}/review")
  @summary("Review leave request (Approve/Reject)")
  reviewLeaveRequest(
    @path id: string,
    @body body: ReviewLeaveRequest,
  ): ApiOkResponse<LeaveRequest> | ApiNotFoundResponse | ApiUnauthorizedResponse;
}
