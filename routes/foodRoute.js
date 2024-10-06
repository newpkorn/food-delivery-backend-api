import express from 'express';
import { addFoodItem, getAllFoodItems, removeFoodItem } from '../controllers/foodController.js';
import multer from 'multer';

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

foodRouter.post('/add', upload.single('image'), addFoodItem);
foodRouter.get('/list', getAllFoodItems);
foodRouter.delete('/remove/:id', removeFoodItem);



export default foodRouter;