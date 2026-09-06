import { Hono } from 'hono';
import {
  cancelLeaveRequestUseCase,
  createLeaveQuotaUseCase,
  createLeaveTypeUseCase,
  getLeaveQuotasByMemberUseCase,
  getLeaveRequestsByCompanyUseCase,
  getLeaveRequestsByMemberUseCase,
  getLeaveTypesByCompanyUseCase,
  reviewLeaveRequestUseCase,
  submitLeaveRequestUseCase,
  updateLeaveQuotaUseCase,
  updateLeaveTypeUseCase,
} from '@repo/infrastructures/compositions';
import { LeaveController } from '../controllers/leave.controller';
import { authMiddleware } from '../middleware';

const leaveController = new LeaveController(
  createLeaveTypeUseCase,
  updateLeaveTypeUseCase,
  getLeaveTypesByCompanyUseCase,
  createLeaveQuotaUseCase,
  updateLeaveQuotaUseCase,
  getLeaveQuotasByMemberUseCase,
  submitLeaveRequestUseCase,
  reviewLeaveRequestUseCase,
  cancelLeaveRequestUseCase,
  getLeaveRequestsByMemberUseCase,
  getLeaveRequestsByCompanyUseCase,
);

const leaveRoutes = new Hono();

leaveRoutes.use('*', authMiddleware);

// Leave Types
leaveRoutes.post('/types', leaveController.createType);
leaveRoutes.put('/types/:id', leaveController.updateType);
leaveRoutes.get(
  '/companies/:companyId/types',
  leaveController.getTypesByCompany,
);

// Leave Quotas
leaveRoutes.post('/quotas', leaveController.createQuota);
leaveRoutes.put('/quotas/:id', leaveController.updateQuota);
leaveRoutes.get(
  '/members/:memberId/quotas/:year',
  leaveController.getQuotasByMember,
);

// Leave Requests
leaveRoutes.post('/requests', leaveController.submitRequest);
leaveRoutes.post('/requests/:id/review', leaveController.reviewRequest);
leaveRoutes.post('/requests/:id/cancel', leaveController.cancelRequest);
leaveRoutes.get(
  '/members/:memberId/requests',
  leaveController.getMemberRequests,
);
leaveRoutes.get(
  '/companies/:companyId/requests',
  leaveController.getCompanyRequests,
);

export default leaveRoutes;
