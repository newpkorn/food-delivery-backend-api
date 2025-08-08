import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './config/db.js';
import foodRoute from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import adminRouter from './routes/adminRoute.js';
import Pusher from 'pusher';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});

const app = express();
const PORT = process.env.PORT || 5181;

// CORS setup
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ADMIN_URL,
    'https://food-delivery-backend-api.vercel.app',
    'http://localhost:3000',
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

app.use(cors(corsOptions));
app.use(express.json());

// db connection
connectDB();

// api endpoints
app.use('/api/food', foodRoute);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);

// Pusher endpoint
app.post('/api/orders/update', (req, res) => {
    try {
        const { orderId, status } = req.body;

        pusher.trigger('orders', 'order-updated', {
            orderId,
            status,
            updatedAt: new Date(),
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

// error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

export default app;
