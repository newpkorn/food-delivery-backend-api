import express from 'express';
import {
  addToCart,
  removeFromCart,
  fetchCart,
} from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post('/add', authMiddleware, addToCart);
cartRouter.post('/remove', authMiddleware, removeFromCart);
cartRouter.post('/get', authMiddleware, fetchCart);

export default cartRouter;
