import express from 'express';
import {
  addFoodItem,
  getAllFoodItems,
  removeFoodItem,
  updateFoodItem,
} from '../controllers/foodController.js';
import { upload } from '../config/cloudinary.js';
import { adminMiddleware, authMiddleware } from '../middleware/auth.js';

const foodRouter = express.Router();

foodRouter.post(
  '/add',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  addFoodItem
);

foodRouter.get('/list', getAllFoodItems);

foodRouter.delete(
  '/remove/:id',
  authMiddleware,
  adminMiddleware,
  removeFoodItem
);

foodRouter.patch(
  '/update/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  updateFoodItem
);

export default foodRouter;
