import { Hono } from 'hono';
import {
  checkInAttendanceUseCase,
  createCheckInScheduleUseCase,
  createScheduleSlotUseCase,
  deleteScheduleSlotUseCase,
  getAttendanceLogsByOrganizationUseCase,
  getAttendanceLogsByMemberUseCase,
  getCheckInSchedulesByRoleUseCase,
  getCheckInSchedulesByOrganizationUseCase,
  getScheduleSlotsByScheduleUseCase,
  manualCheckInAttendanceUseCase,
  updateCheckInScheduleUseCase,
  updateScheduleSlotUseCase,
} from '@repo/infrastructures/compositions';
import { AttendanceController } from '../controllers/attendance.controller';
import { authMiddleware } from '../middleware';

const attendanceController = new AttendanceController(
  createCheckInScheduleUseCase,
  updateCheckInScheduleUseCase,
  getCheckInSchedulesByRoleUseCase,
  getCheckInSchedulesByOrganizationUseCase,
  createScheduleSlotUseCase,
  updateScheduleSlotUseCase,
  deleteScheduleSlotUseCase,
  getScheduleSlotsByScheduleUseCase,
  checkInAttendanceUseCase,
  manualCheckInAttendanceUseCase,
  getAttendanceLogsByMemberUseCase,
  getAttendanceLogsByOrganizationUseCase,
);

const attendanceRoutes = new Hono();

attendanceRoutes.use('*', authMiddleware);

// Check-in schedules
attendanceRoutes.post('/schedules', attendanceController.createSchedule);
attendanceRoutes.put('/schedules/:id', attendanceController.updateSchedule);
attendanceRoutes.get(
  '/organizations/:organizationId/roles/:roleId/schedules',
  attendanceController.getSchedulesByRole,
);
attendanceRoutes.get(
  '/organizations/:organizationId/schedules',
  attendanceController.getSchedulesByOrganization,
);

// Schedule slots
attendanceRoutes.post(
  '/schedules/:scheduleId/slots',
  attendanceController.createSlot,
);
attendanceRoutes.put('/slots/:id', attendanceController.updateSlot);
attendanceRoutes.delete('/slots/:id', attendanceController.deleteSlot);
attendanceRoutes.get(
  '/schedules/:scheduleId/slots',
  attendanceController.getSlotsBySchedule,
);

// Attendance logs
attendanceRoutes.post('/check-in', attendanceController.checkIn);
attendanceRoutes.post('/manual-check-in', attendanceController.manualCheckIn);
attendanceRoutes.get(
  '/members/:memberId/logs',
  attendanceController.getMemberLogs,
);
attendanceRoutes.get(
  '/organizations/:organizationId/logs',
  attendanceController.getOrganizationLogs,
);

export default attendanceRoutes;
