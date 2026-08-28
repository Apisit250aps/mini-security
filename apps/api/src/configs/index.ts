import dotenv from 'dotenv';
dotenv.config();

export default {
  port: Number(process.env.PORT) || 8000,
};