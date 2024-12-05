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
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_ADMIN_URL],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true // ต้องมี credentials: true
  }
});

// middlewares
app.use(express.json());
app.use((req, res, next) => {
  const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_ADMIN_URL];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_ADMIN_URL];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
}));


app.options('*', (req, res) => {
  const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_ADMIN_URL];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  }
  res.sendStatus(200); // ส่งสถานะ 200 OK
});


// db connection
connectDB();

// api endpoints
app.use('/api/food', foodRoute);
app.use('/images', express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);

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
