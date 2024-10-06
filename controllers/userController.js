
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";


// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = createToken(user._id, user._id);
    res.status(200).json({ success: true, data: user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.VITE_JWT_SECRET, { expiresIn: "1d" });
};

// register user
const registerUser = async (req, res) => {
  const {name, email, password, confirmPassword } = req.body;
  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = createToken(user._id);

    res.status(201).json({ success: true, data: user, token });
  } catch (error) {
    res.status(500).json({ seccess: false, message: "Server error" });
  }
}

// get current login user
const getMe = async (req, res) => {
  const user = await userModel.findById(req.body.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.status(200).json({ success: true, data: user});
};


export { loginUser, registerUser, getMe };