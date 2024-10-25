import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import foodRoute from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

// app config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5181;

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('new-order', (order) => {
    io.emit('new-order', order);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// middlewares
app.use(express.json());
app.use(cors());

// db connection
connectDB();

// api endpoints
app.use('/api/food', foodRoute);
app.use('/images', express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
