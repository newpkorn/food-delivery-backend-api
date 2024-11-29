import express from 'express';
import { createAdminUser, loginAdmin } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/login', loginAdmin);
adminRouter.post('/create', createAdminUser);

export default adminRouter;