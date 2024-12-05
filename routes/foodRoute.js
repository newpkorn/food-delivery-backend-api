import express from 'express';
import { addFoodItem, getAllFoodItems, removeFoodItem, updateFoodItem } from '../controllers/foodController.js';
import { upload } from '../config/cloudinary.js';
import authMiddleware from '../middleware/auth.js';

const foodRouter = express.Router();

foodRouter.post('/add', authMiddleware, upload.single('image'), addFoodItem);
foodRouter.get('/list', getAllFoodItems);
foodRouter.delete('/remove/:id', authMiddleware, removeFoodItem);
foodRouter.patch('/update/:id', authMiddleware, upload.single('image'), updateFoodItem);



export default foodRouter;