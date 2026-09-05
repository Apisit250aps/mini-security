import { Hono } from 'hono';
import {
  approveAttendanceRecordUseCase,
  assignCheckpointLocationUseCase,
  assignRoleAttendancePolicyUseCase,
  assignRoleWorkScheduleUseCase,
  createAttendanceCheckpointUseCase,
  createAttendanceLocationUseCase,
  createAttendanceLogUseCase,
  createAttendancePolicyUseCase,
  createAttendanceRecordUseCase,
  createLeaveRequestUseCase,
  createWorkScheduleUseCase,
  createWorkShiftUseCase,
  deleteAttendanceCheckpointUseCase,
  deleteAttendanceLocationUseCase,
  deleteAttendanceLogUseCase,
  deleteAttendancePolicyUseCase,
  deleteAttendanceRecordUseCase,
  deleteLeaveRequestUseCase,
  deleteRoleWorkScheduleUseCase,
  deleteWorkScheduleUseCase,
  deleteWorkShiftUseCase,
  getAttendanceCheckpointUseCase,
  getAttendanceCheckpointsUseCase,
  getAttendanceLocationsUseCase,
  getAttendanceLocationUseCase,
  getAttendanceLogsByRecordUseCase,
  getAttendanceLogUseCase,
  getAttendancePoliciesUseCase,
  getAttendancePolicyUseCase,
  getAttendanceRecordsUseCase,
  getAttendanceRecordUseCase,
  getCheckpointLocationsUseCase,
  getCurrentRoleWorkScheduleUseCase,
  getLeaveRequestsUseCase,
  getLeaveRequestUseCase,
  getMemberAttendanceRecordByDateUseCase,
  getRoleAttendancePoliciesUseCase,
  getRoleWorkSchedulesByCompanyUseCase,
  getRoleWorkScheduleUseCase,
  getWorkSchedulesUseCase,
  getWorkScheduleUseCase,
  getWorkShiftsUseCase,
  getWorkShiftUseCase,
  getCompanyWorkShiftsUseCase,
  removeCheckpointLocationUseCase,
  removeRoleAttendancePolicyUseCase,
  reviewLeaveRequestUseCase,
  updateAttendanceCheckpointUseCase,
  updateAttendanceLocationUseCase,
  updateAttendanceLogUseCase,
  updateAttendancePolicyUseCase,
  updateAttendanceRecordUseCase,
  updateLeaveRequestUseCase,
  updateRoleWorkScheduleUseCase,
  updateWorkScheduleUseCase,
  updateWorkShiftUseCase,
} from '@repo/infrastructures/compositions';
import { AttendanceController } from '../controllers/attendance.controller';
import { authMiddleware } from '../middleware';

const attendanceController = new AttendanceController(
  createWorkScheduleUseCase,
  updateWorkScheduleUseCase,
  deleteWorkScheduleUseCase,
  getWorkScheduleUseCase,
  getWorkSchedulesUseCase,
  createWorkShiftUseCase,
  updateWorkShiftUseCase,
  deleteWorkShiftUseCase,
  getWorkShiftUseCase,
  getWorkShiftsUseCase,
  getCompanyWorkShiftsUseCase,
  createAttendancePolicyUseCase,
  updateAttendancePolicyUseCase,
  deleteAttendancePolicyUseCase,
  getAttendancePolicyUseCase,
  getAttendancePoliciesUseCase,
  createAttendanceCheckpointUseCase,
  updateAttendanceCheckpointUseCase,
  deleteAttendanceCheckpointUseCase,
  getAttendanceCheckpointUseCase,
  getAttendanceCheckpointsUseCase,
  assignRoleAttendancePolicyUseCase,
  removeRoleAttendancePolicyUseCase,
  getRoleAttendancePoliciesUseCase,
  createAttendanceLocationUseCase,
  updateAttendanceLocationUseCase,
  deleteAttendanceLocationUseCase,
  getAttendanceLocationUseCase,
  getAttendanceLocationsUseCase,
  assignCheckpointLocationUseCase,
  removeCheckpointLocationUseCase,
  getCheckpointLocationsUseCase,
  assignRoleWorkScheduleUseCase,
  updateRoleWorkScheduleUseCase,
  deleteRoleWorkScheduleUseCase,
  getRoleWorkScheduleUseCase,
  getRoleWorkSchedulesByCompanyUseCase,
  getCurrentRoleWorkScheduleUseCase,
  createAttendanceRecordUseCase,
  updateAttendanceRecordUseCase,
  deleteAttendanceRecordUseCase,
  getAttendanceRecordUseCase,
  getAttendanceRecordsUseCase,
  getMemberAttendanceRecordByDateUseCase,
  approveAttendanceRecordUseCase,
  createAttendanceLogUseCase,
  updateAttendanceLogUseCase,
  deleteAttendanceLogUseCase,
  getAttendanceLogUseCase,
  getAttendanceLogsByRecordUseCase,
  createLeaveRequestUseCase,
  updateLeaveRequestUseCase,
  deleteLeaveRequestUseCase,
  getLeaveRequestUseCase,
  getLeaveRequestsUseCase,
  reviewLeaveRequestUseCase,
);

const attendanceRoutes = new Hono();

attendanceRoutes.use('*', authMiddleware);

// 1. Work Schedules
attendanceRoutes.get(
  '/companies/:companyId/schedules',
  attendanceController.getWorkSchedules,
);
attendanceRoutes.get('/schedules/:id', attendanceController.getWorkSchedule);
attendanceRoutes.post('/schedules', attendanceController.createWorkSchedule);
attendanceRoutes.put('/schedules/:id', attendanceController.updateWorkSchedule);
attendanceRoutes.delete(
  '/schedules/:id',
  attendanceController.deleteWorkSchedule,
);

// 2. Work Shifts
attendanceRoutes.get(
  '/companies/:companyId/shifts',
  attendanceController.getCompanyWorkShifts,
);
attendanceRoutes.get(
  '/schedules/:workScheduleId/shifts',
  attendanceController.getWorkShifts,
);
attendanceRoutes.get('/shifts/:id', attendanceController.getWorkShift);
attendanceRoutes.post('/shifts', attendanceController.createWorkShift);
attendanceRoutes.put('/shifts/:id', attendanceController.updateWorkShift);
attendanceRoutes.delete('/shifts/:id', attendanceController.deleteWorkShift);

// 3. Attendance Policies
attendanceRoutes.get(
  '/companies/:companyId/policies',
  attendanceController.getAttendancePolicies,
);
attendanceRoutes.get('/policies/:id', attendanceController.getAttendancePolicy);
attendanceRoutes.post('/policies', attendanceController.createAttendancePolicy);
attendanceRoutes.put(
  '/policies/:id',
  attendanceController.updateAttendancePolicy,
);
attendanceRoutes.delete(
  '/policies/:id',
  attendanceController.deleteAttendancePolicy,
);

// 4. Attendance Checkpoints
attendanceRoutes.get(
  '/policies/:policyId/checkpoints',
  attendanceController.getAttendanceCheckpoints,
);
attendanceRoutes.get(
  '/checkpoints/:id',
  attendanceController.getAttendanceCheckpoint,
);
attendanceRoutes.post(
  '/checkpoints',
  attendanceController.createAttendanceCheckpoint,
);
attendanceRoutes.put(
  '/checkpoints/:id',
  attendanceController.updateAttendanceCheckpoint,
);
attendanceRoutes.delete(
  '/checkpoints/:id',
  attendanceController.deleteAttendanceCheckpoint,
);

// 5. Role Attendance Policies
attendanceRoutes.get(
  '/roles/:roleId/policies',
  attendanceController.getRoleAttendancePolicies,
);
attendanceRoutes.post(
  '/role-policies',
  attendanceController.assignRoleAttendancePolicy,
);
attendanceRoutes.delete(
  '/roles/:roleId/policies/:policyId',
  attendanceController.removeRoleAttendancePolicy,
);

// 6. Attendance Locations
attendanceRoutes.get(
  '/companies/:companyId/locations',
  attendanceController.getAttendanceLocations,
);
attendanceRoutes.get(
  '/locations/:id',
  attendanceController.getAttendanceLocation,
);
attendanceRoutes.post(
  '/locations',
  attendanceController.createAttendanceLocation,
);
attendanceRoutes.put(
  '/locations/:id',
  attendanceController.updateAttendanceLocation,
);
attendanceRoutes.delete(
  '/locations/:id',
  attendanceController.deleteAttendanceLocation,
);

// 7. Checkpoint Locations
attendanceRoutes.get(
  '/checkpoints/:checkpointId/locations',
  attendanceController.getCheckpointLocations,
);
attendanceRoutes.post(
  '/checkpoint-locations',
  attendanceController.assignCheckpointLocation,
);
attendanceRoutes.delete(
  '/checkpoints/:checkpointId/locations/:locationId',
  attendanceController.removeCheckpointLocation,
);

// 8. Role Schedules
attendanceRoutes.get(
  '/companies/:companyId/role-schedules',
  attendanceController.getRoleWorkSchedulesByCompany,
);
attendanceRoutes.get(
  '/roles/:roleId/schedules/current',
  attendanceController.getCurrentRoleWorkSchedule,
);
attendanceRoutes.post(
  '/role-schedules',
  attendanceController.assignRoleWorkSchedule,
);
attendanceRoutes.put(
  '/role-schedules/:id',
  attendanceController.updateRoleWorkSchedule,
);
attendanceRoutes.delete(
  '/role-schedules/:id',
  attendanceController.deleteRoleWorkSchedule,
);

// 9. Attendance Records
attendanceRoutes.get('/records', attendanceController.getAttendanceRecords);
attendanceRoutes.get(
  '/records/by-member-date',
  attendanceController.getMemberAttendanceRecordByDate,
);
attendanceRoutes.get('/records/:id', attendanceController.getAttendanceRecord);
attendanceRoutes.post('/records', attendanceController.createAttendanceRecord);
attendanceRoutes.put(
  '/records/:id',
  attendanceController.updateAttendanceRecord,
);
attendanceRoutes.delete(
  '/records/:id',
  attendanceController.deleteAttendanceRecord,
);
attendanceRoutes.post(
  '/records/:id/approve',
  attendanceController.approveAttendanceRecord,
);

// 10. Attendance Logs
attendanceRoutes.get(
  '/records/:attendanceRecordId/logs',
  attendanceController.getAttendanceLogsByRecord,
);
attendanceRoutes.get('/logs/:id', attendanceController.getAttendanceLog);
attendanceRoutes.post('/logs', attendanceController.createAttendanceLog);
attendanceRoutes.put('/logs/:id', attendanceController.updateAttendanceLog);
attendanceRoutes.delete('/logs/:id', attendanceController.deleteAttendanceLog);

// 11. Leave Requests
attendanceRoutes.get('/leave-requests', attendanceController.getLeaveRequests);
attendanceRoutes.get(
  '/leave-requests/:id',
  attendanceController.getLeaveRequest,
);
attendanceRoutes.post(
  '/leave-requests',
  attendanceController.createLeaveRequest,
);
attendanceRoutes.put(
  '/leave-requests/:id',
  attendanceController.updateLeaveRequest,
);
attendanceRoutes.delete(
  '/leave-requests/:id',
  attendanceController.deleteLeaveRequest,
);
attendanceRoutes.post(
  '/leave-requests/:id/review',
  attendanceController.reviewLeaveRequest,
);

export default attendanceRoutes;
