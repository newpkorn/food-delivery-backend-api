import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import connectDB from './config/db.js';
import foodRoute from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5181;
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
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

let connectionCount = 0;

io.on('connection', (socket) => {
  connectionCount++;
  if (connectionCount === 1) {
    console.log('User connected:', socket.id);
  }

  socket.on('newOrder', (data) => {
    io.sockets.emit('orderUpdated', data);
  });

  socket.on('disconnect', () => {
    connectionCount--;
    if (connectionCount === 0) {
      console.log('All users disconnected');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
