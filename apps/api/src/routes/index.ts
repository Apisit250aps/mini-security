import { Hono } from 'hono';
import userRoutes from './user.route';
import organizationRoutes from './organization.route';
import permissionRoutes from './permission.route';
import featureRoutes from './feature.route';
import attendanceRoutes from './attendance.route';
import leaveRoutes from './leave.route';
import formRoutes from './form.route';
import locationRoutes from './location.route';

const apiRoutes = new Hono();

apiRoutes.route('/users', userRoutes);
apiRoutes.route('/organizations', organizationRoutes);
apiRoutes.route('/permissions', permissionRoutes);
apiRoutes.route('/features', featureRoutes);
apiRoutes.route('/attendances', attendanceRoutes);
apiRoutes.route('/leaves', leaveRoutes);
apiRoutes.route('/forms', formRoutes);
apiRoutes.route('/locations', locationRoutes);

export default apiRoutes;
