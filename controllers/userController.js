import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import fs from "fs";


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
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// register user
const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
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
};

// get current login user
const getMe = async (req, res) => {
  const user = await userModel.findById(req.body.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.status(200).json({ success: true, data: user });
};

// update user info
const updateUserInfo = async (req, res) => {
  const { id } = req.params;
  let image_filename = req.file ? req.file.filename : null;
  const { name, email, address, phoneNumber, password, newPassword, confirmPassword } = req.body;

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // checking password before updating the user info.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // if incorrect password and new image is uploaded, delete the new image
      if (image_filename) {
        await fs.unlink(`uploads/users/${id}/${image_filename}`, (err) => {
          if (err) {
            console.error("Error deleting new image:", err);
          } else {
            console.log("New image deleted due to invalid password: ", image_filename);
          }
        });
      }
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Update user information if password is valid
    if (name) {
      user.name = name;
    }
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email" });
      }
      const emailExists = await userModel.exists({ email: email, _id: { $ne: user._id } });
      if (emailExists) {
        console.log("Email already exists");
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
      user.email = email;
    }
    if (address) {
      user.address = address;
    }
    if (phoneNumber) {
      if (!validator.isMobilePhone(phoneNumber, 'any')) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
      }
      user.phoneNumber = phoneNumber;
    }

    // verifying new password and confirm password
    if (newPassword && confirmPassword) {
      if (!validator.isLength(newPassword, { min: 8 })) {
        return res.status(400).json({ success: false, message: "New password must be at least 8 characters long" });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "New passwords do not match" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword; // update the password
    }

    // Update image if a new one is uploaded
    if (image_filename) {
      const currentImage = user.image;
      user.image = image_filename;

      // Delete the old image if it exists
      if (currentImage) {
        await fs.unlink(`uploads/users/${id}/${currentImage}`, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          } else {
            console.log("Old image deleted successfully: ", currentImage);
          }
        });
      }
    }

    await user.save();
    return res.status(200).json({ success: true, message: 'User information updated successfully', data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export { loginUser, registerUser, getMe, updateUserInfo };