import { Hono } from 'hono';
import userRoutes from './user.route';
import companyRoutes from './company.route';
import permissionRoutes from './permission.route';
import featureRoutes from './feature.route';
import attendanceRoutes from './attendance.route';
import leaveRoutes from './leave.route';

const apiRoutes = new Hono();

apiRoutes.route('/users', userRoutes);
apiRoutes.route('/companies', companyRoutes);
apiRoutes.route('/permissions', permissionRoutes);
apiRoutes.route('/features', featureRoutes);
apiRoutes.route('/attendances', attendanceRoutes);
apiRoutes.route('/leaves', leaveRoutes);

export default apiRoutes;
