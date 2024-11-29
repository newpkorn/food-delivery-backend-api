import express from 'express';
import { addFoodItem, getAllFoodItems, removeFoodItem, updateFoodItem } from '../controllers/foodController.js';
import { upload } from '../config/cloudinary.js';

const foodRouter = express.Router();

foodRouter.post('/add', upload.single('image'), addFoodItem);
foodRouter.get('/list', getAllFoodItems);
foodRouter.delete('/remove/:id', removeFoodItem);
foodRouter.patch('/update/:id', upload.single('image'), updateFoodItem);



export default foodRouter;