import express from 'express';
import { loginUser, registerUser, getMe, updateUserInfo } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';

import fs from "fs";

const userRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.id;
    const uploadPath = `uploads/users/${userId}`;

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const username = req.body.name;
    cb(null, Date.now() + '-' + username + '-' + file.originalname);
  },
});


const upload = multer({ storage: storage });

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/me', authMiddleware, getMe);

userRouter.patch('/update/:id', authMiddleware, upload.single('image'), updateUserInfo);

export default userRouter;