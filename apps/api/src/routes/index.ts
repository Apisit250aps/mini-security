import { Hono } from 'hono';
import userRoutes from './user.route';
import companyRoutes from './company.route';
import permissionRoutes from './permission.route';
import attendanceRoutes from './attendance.route';
import featureRoutes from './feature.route';

const apiRoutes = new Hono();

apiRoutes.route('/users', userRoutes);
apiRoutes.route('/companies', companyRoutes);
apiRoutes.route('/permissions', permissionRoutes);
apiRoutes.route('/attendance', attendanceRoutes);
apiRoutes.route('/features', featureRoutes);

export default apiRoutes;
