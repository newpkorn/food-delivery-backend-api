import express from 'express';
import {
  loginUser,
  registerUser,
  getMe,
  updateUserInfo,
} from '../controllers/userController.js';
import { upload } from '../config/cloudinary.js';
import { authMiddleware } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/getMe', authMiddleware, getMe);

userRouter.patch(
  '/update/:id',
  authMiddleware,
  upload.single('image'),
  updateUserInfo
);

export default userRouter;
