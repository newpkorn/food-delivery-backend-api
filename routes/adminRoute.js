import express from 'express';
import { createAdminUser, getMe, loginAdmin } from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';

const adminRouter = express.Router();

adminRouter.post('/login', loginAdmin);
adminRouter.post('/create', createAdminUser);

adminRouter.get('/me', authMiddleware, getMe);

export default adminRouter;