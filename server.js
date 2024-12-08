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
import adminRouter from './routes/adminRoute.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5181;
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, process.env.FREND_ADMIN_URL],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// middlewares
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ADMIN_URL,
  ];
  const origin = req.headers.origin;

  // Check if the origin is in the allowedOrigins array
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin); // Allow requests from the specified origin
  }

  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PATCH, PUT, DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials (cookies, authorization headers)

  // For preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// db connection
connectDB();

// api endpoints
app.get('/', (req, res) => {
  res.send('Server is running');
});
app.use('/images', express.static('uploads'));
app.use('/api/food', foodRoute);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Socket.IO event handling
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

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
