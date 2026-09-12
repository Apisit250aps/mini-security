import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/attendances")
@tag("Attendance")
interface AttendanceServices {
  // ─── Check-In Schedules ───────────────────────────────────────────────────
  @post
  @route("/schedules")
  @summary("Create check-in schedule")
  createSchedule(@body body: CreateCheckInSchedule):
    | ApiCreatedResponse<CheckInSchedule>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/schedules/{id}")
  @summary("Update check-in schedule")
  updateSchedule(@path id: string, @body body: UpdateCheckInSchedule):
    | ApiOkResponse<CheckInSchedule>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/companies/{companyId}/roles/{roleId}/schedules")
  @summary("Get active check-in schedules assigned to a role in a company")
  getSchedulesByRole(@path companyId: string, @path roleId: string):
    | ApiOkResponse<CheckInSchedule[]>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/companies/{companyId}/schedules")
  @summary("Get check-in schedules by company")
  getSchedulesByCompany(@path companyId: string):
    | ApiOkResponse<CheckInSchedule[]>
    | ApiUnauthorizedResponse;

  // ─── Schedule Slots ────────────────────────────────────────────────────────
  @post
  @route("/schedules/{scheduleId}/slots")
  @summary("Create schedule slot")
  createSlot(@path scheduleId: string, @body body: CreateScheduleSlot):
    | ApiCreatedResponse<ScheduleSlot>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/slots/{id}")
  @summary("Update schedule slot")
  updateSlot(@path id: string, @body body: UpdateScheduleSlot):
    | ApiOkResponse<ScheduleSlot>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/slots/{id}")
  @summary("Delete schedule slot")
  deleteSlot(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/schedules/{scheduleId}/slots")
  @summary("Get schedule slots by schedule")
  getSlotsBySchedule(@path scheduleId: string):
    | ApiOkResponse<ScheduleSlot[]>
    | ApiUnauthorizedResponse;

  // ─── Attendance Logs ───────────────────────────────────────────────────────
  @post
  @route("/check-in")
  @summary("Check in attendance")
  checkIn(@body body: CheckInRequest):
    | ApiOkResponse<AttendanceLog>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/manual-check-in")
  @summary("Manual check in attendance by supervisor/admin")
  manualCheckIn(@body body: CreateAttendanceLog):
    | ApiCreatedResponse<AttendanceLog>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/members/{memberId}/logs")
  @summary("Get attendance logs by member")
  getMemberLogs(
    @path memberId: string,
    @query workDate?: string,
    @query startDate?: string,
    @query endDate?: string,
  ):
    | ApiOkResponse<AttendanceLog[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/companies/{companyId}/logs")
  @summary("Get company attendance logs by date range")
  getCompanyLogs(
    @path companyId: string,
    @query startDate: string,
    @query endDate: string,
  ):
    | ApiOkResponse<AttendanceLog[]>
    | ApiUnauthorizedResponse;
}
