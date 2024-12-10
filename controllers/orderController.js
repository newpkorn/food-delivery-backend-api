import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const placeOrder = async (req, res) => {
  console.log('req.body: ', req.body);
  const { items, amount, address } = req.body;
  const userId = req.user.id;
  const frontend_url = process.env.FRONTEND_URL;

  try {
    const newOrder = new orderModel({ userId, items, amount, address });
    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'thb',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: 'thb',
        product_data: {
          name: 'Delivery Charges',
        },
        unit_amount: 10000 / 2, // Price (in satang) here is 100.00 baht (10,000 satang)
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: 'payment',
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder._id,
      session_url: session.url,
    });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const verifyOrder = async (req, res) => {
  const { success, orderId } = req.body;
  console.log('Received:', { success, orderId });
  try {
    if (success === 'true') {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.status(200).json({ success: true, message: 'Payment verified' });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.status(400).json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user.id });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Listening orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Tracking order status
const trackOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// api for updating order status
const updateOrderStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res
      .status(200)
      .json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateOrderStatus,
  trackOrder,
};
