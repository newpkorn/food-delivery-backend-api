import userModel from '../models/userModel.js';

// // add items to user cart
// const addToCart = async (req, res) => {
//   const { userId, itemId } = req.body;
//   try {
//     let userData = await userModel.findById(userId);
//     let cartData = await userData.cartData;
//     if (!cartData[itemId]) {
//       cartData[itemId] = 1;
//     } else {
//       cartData[itemId] += 1;
//     }
//     await userModel.findByIdAndUpdate(userId, {cartData});
//     return res.status(200).json({ success: true, message: "Item added to cart" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// }

// // remove items to user cart
// const removeFromCart = async (req, res) => {
//   const { userId, itemId } = req.body;
//   try {
//     let userData = await userModel.findById(userId);
//     let cartData = await userData.cartData;
//     if (cartData[itemId] > 0) {
//       cartData[itemId] -= 1;
//     }
//     await userModel.findByIdAndUpdate(userId, {cartData});
//     return res.status(200).json({ success: true, message: "Item removed from cart" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// }

// add items to user cart
const addToCart = async (req, res) => {
  const { userId, itemId } = req.body;
  try {
    let userData = await userModel.findById(userId);
    let cartData = userData.cartData || {}; // กำหนด cartData ให้เป็นว่างถ้าหากไม่มีข้อมูล
    if (!cartData[itemId]) {
      cartData[itemId] = 1; // ถ้าไม่มีสินค้าในตะกร้า ให้เพิ่มเข้าไป 1
    } else {
      cartData[itemId] += 1; // ถ้ามีสินค้าแล้ว ให้เพิ่มจำนวน
    }
    await userModel.findByIdAndUpdate(userId, { cartData });
    return res.status(200).json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// remove items from user cart
const removeFromCart = async (req, res) => {
  const { userId, itemId } = req.body;
  try {
    let userData = await userModel.findById(userId);
    let cartData = userData.cartData || {}; // กำหนด cartData ให้เป็นว่างถ้าหากไม่มีข้อมูล
    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1; // ลดจำนวนสินค้าในตะกร้า
    }
    // หากจำนวนสินค้าเป็น 0 ให้ลบสินค้าออกจากตะกร้า
    if (cartData[itemId] === 0) {
      delete cartData[itemId];
    }
    await userModel.findByIdAndUpdate(userId, { cartData });
    return res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}


// fetch user cart
const fetchCart = async (req, res) => {
  const { userId } = req.body;
  try {
    // Find user by userId
    const userData = await userModel.findById(userId);
    
    // Check if user exists and has cartData
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Directly access cartData (no need for await here)
    const cartData = userData.cartData;
    
    // Return cart data in response
    return res.status(200).json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export { addToCart, removeFromCart, fetchCart };