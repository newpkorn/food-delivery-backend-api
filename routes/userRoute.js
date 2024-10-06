import express from 'express';
import { loginUser, registerUser, getMe } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/me', authMiddleware, getMe);

export default userRouter;