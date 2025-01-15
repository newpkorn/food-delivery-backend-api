import userModel from '../models/userModel.js';

// add items to user cart
const addToCart = async (req, res) => {
  const { itemId } = req.body;
  const userId = req.user.id;
  try {
    let userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};
    if (!cartData[itemId]) {
      cartData[itemId] = 1;
    } else {
      cartData[itemId] += 1;
    }
    await userModel.findByIdAndUpdate(userId, { cartData });
    return res
      .status(200)
      .json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// remove items from user cart
const removeFromCart = async (req, res) => {
  const { itemId } = req.body;
  const userId = req.user.id;
  try {
    let userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};
    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
    }
    if (cartData[itemId] === 0) {
      delete cartData[itemId];
    }
    await userModel.findByIdAndUpdate(userId, { cartData });
    return res
      .status(200)
      .json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// fetch user cart
const fetchCart = async (req, res) => {
  const userId = req.user.id;
  try {
    // Find user by userId
    const userData = await userModel.findById(userId);

    // Check if user exists and has cartData
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Directly access cartData (no need for await here)
    const cartData = userData.cartData;

    // Return cart data in response
    return res.status(200).json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { addToCart, removeFromCart, fetchCart };
