import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import foodRoute from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';


// app config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5181;

// middlewares
app.use(express.json());
app.use(cors());
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// db connection
connectDB();

// api endpoints
app.use('/api/food', foodRoute);
app.use('/images', express.static('uploads'));
// app.use('/images', express.static(path.join(__dirname, 'uploads')));
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// listen
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});