import { Hono } from 'hono';
import userRoutes from './user.route';
import companyRoutes from './company.route';
import permissionRoutes from './permission.route';

const apiRoutes = new Hono();

apiRoutes.route('/users', userRoutes);
apiRoutes.route('/companies', companyRoutes);
apiRoutes.route('/permissions', permissionRoutes);

export default apiRoutes;
