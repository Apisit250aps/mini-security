import { Hono } from 'hono';
import {
  checkInAttendanceUseCase,
  createCheckInScheduleUseCase,
  createScheduleSlotUseCase,
  deleteScheduleSlotUseCase,
  getAttendanceLogsByCompanyUseCase,
  getAttendanceLogsByMemberUseCase,
  getCheckInSchedulesByRoleUseCase,
  getCheckInSchedulesByCompanyUseCase,
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
  getCheckInSchedulesByCompanyUseCase,
  createScheduleSlotUseCase,
  updateScheduleSlotUseCase,
  deleteScheduleSlotUseCase,
  getScheduleSlotsByScheduleUseCase,
  checkInAttendanceUseCase,
  manualCheckInAttendanceUseCase,
  getAttendanceLogsByMemberUseCase,
  getAttendanceLogsByCompanyUseCase,
);

const attendanceRoutes = new Hono();

attendanceRoutes.use('*', authMiddleware);

// Check-in schedules
attendanceRoutes.post('/schedules', attendanceController.createSchedule);
attendanceRoutes.put('/schedules/:id', attendanceController.updateSchedule);
attendanceRoutes.get(
  '/companies/:companyId/roles/:roleId/schedules',
  attendanceController.getSchedulesByRole,
);
attendanceRoutes.get(
  '/companies/:companyId/schedules',
  attendanceController.getSchedulesByCompany,
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
  '/companies/:companyId/logs',
  attendanceController.getCompanyLogs,
);

export default attendanceRoutes;
