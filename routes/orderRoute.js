import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { listOrders, placeOrder, trackOrder, updateOrderStatus, userOrders, verifyOrder } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/verify', verifyOrder);
orderRouter.post('/userorders', authMiddleware, userOrders);

orderRouter.patch('/status', updateOrderStatus)

orderRouter.get('/list', authMiddleware, listOrders);
orderRouter.get('/trackorder/:orderId', authMiddleware, trackOrder);

export default orderRouter;