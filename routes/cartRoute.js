import express from 'express';
import {
  addToCart,
  removeFromCart,
  fetchCart,
} from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post('/addCart', authMiddleware, addToCart);
cartRouter.post('/removeCart', authMiddleware, removeFromCart);
cartRouter.post('/getCart', authMiddleware, fetchCart);

export default cartRouter;
