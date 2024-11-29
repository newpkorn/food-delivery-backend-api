import express from 'express';
import { loginUser, registerUser, getMe, updateUserInfo } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const userRouter = express.Router();


userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/me', authMiddleware, getMe);

userRouter.patch('/update/:id', authMiddleware, upload.single('image'), updateUserInfo);

export default userRouter;