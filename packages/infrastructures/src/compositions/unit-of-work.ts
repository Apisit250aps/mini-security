import db from '@repo/database/db';
import { UnitOfWork } from '../unit-of-work';

export const unitOfWork = new UnitOfWork(db);
