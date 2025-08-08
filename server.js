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

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5181;
const server = http.createServer(app);

// CORS setup
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ADMIN_URL,
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions)); // Apply CORS middleware globally

// middlewares
app.use(express.json());

// db connection
connectDB();

// api endpoints
app.use('/images', express.static('uploads'));
app.use('/api/food', foodRoute);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);

// error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Socket.IO setup
const io = new Server(server, corsOptions);

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
