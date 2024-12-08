import jwt from 'jsonwebtoken';
import validator from 'validator';
import bcrypt from 'bcrypt';
import adminModel from '../models/adminModel.js';

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const adminUser = await adminModel.findOne({ username });
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid username' });
    }
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = createToken(adminUser._id, adminUser.role);
    res.status(200).json({ success: true, data: adminUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdminUser = async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;
  try {
    if (!name || !username || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }
    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Passwords do not match' });
    }
    const existingAdminUser = await adminModel.findOne({ username: username });
    if (existingAdminUser) {
      return res
        .status(400)
        .json({ success: false, message: 'The username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new adminModel({
      name,
      username,
      password: hashedPassword,
    });

    await adminUser.save();

    res.status(201).json({ success: true, data: adminUser });
  } catch (error) {
    res.status(500).json({ seccess: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  const admin = await adminModel.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, data: admin });
};

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export { loginAdmin, createAdminUser, getMe };
