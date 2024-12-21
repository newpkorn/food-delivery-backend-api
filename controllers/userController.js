import jwt from 'jsonwebtoken';
import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import {
  extractPublicId,
  extractPublicIdNumber,
} from '../utils/cloudinaryUtils.js';
import {
  deleteImage,
  deleteOriginalFileName,
  uploadImage,
} from '../config/cloudinary.js';

const userUploadFolder = 'user_images';

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = createToken(user._id, user.role);
    res.status(200).json({ success: true, data: user, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// register user
const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (!name || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
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
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = createToken(user._id);

    res.status(201).json({ success: true, data: user, token });
  } catch (error) {
    res.status(500).json({ seccess: false, message: 'Server error' });
  }
};

// get current login user
const getMe = async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
};

// update user info

const updateUserInfo = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    address,
    phoneNumber,
    password,
    newPassword,
    confirmPassword,
  } = req.body;
  let image_filename;

  if (req.file) {
    image_filename = req.file.filename;
  }

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // checking password before updating the user info.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // if incorrect password and new image is uploaded, delete the new image
    if (!isPasswordValid) {
      if (image_filename) {
        try {
          const originalFileName = image_filename;

          const deleteResult = await deleteImage(
            originalFileName,
            userUploadFolder
          );

          if (
            !deleteResult ||
            deleteResult?.deleted_counts?.[`${originalFileName}`]?.original ===
              0
          ) {
            console.error(
              `Failed to delete image in cloud: ${originalFileName}`
            );
          }

          const deleteOriginalFileNameResult = await deleteOriginalFileName(
            originalFileName.split('/').pop()
          );

          if (
            !deleteOriginalFileNameResult ||
            deleteOriginalFileNameResult?.deleted_counts?.[
              `food_delivery/${originalFileName}`
            ]?.original === 0
          ) {
            console.error(
              `Failed to delete original file image: ${originalFileName}`
            );
          }
        } catch (err) {
          console.error('Error deleting image in cloud:', err);
        }
      }

      return res
        .status(401)
        .json({ success: false, message: 'Invalid password' });
    }

    if (name) user.name = name;
    if (email) {
      if (!validator.isEmail(email)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid email' });
      }
      const emailExists = await userModel.exists({
        email,
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res
          .status(400)
          .json({ success: false, message: 'Email already exists' });
      }
      user.email = email;
    }
    if (address) user.address = address;
    if (phoneNumber) {
      if (!validator.isMobilePhone(phoneNumber, 'any')) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid phone number' });
      }
      user.phoneNumber = phoneNumber;
    }

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: 'New passwords do not match' });
      }
      if (!validator.isLength(newPassword, { min: 8 })) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long',
        });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (image_filename) {
      const currentImage = user.image;
      if (currentImage && typeof currentImage === 'string') {
        const currentImgId = extractPublicIdNumber(currentImage);
        console.log('currentImgId', currentImgId);

        if (currentImgId) {
          const deleteImageResult = await deleteImage(
            currentImgId,
            userUploadFolder
          );
          if (
            !deleteImageResult ||
            deleteImageResult?.deleted_counts?.[
              extractPublicId(currentImage) + ''
            ]?.original === 0
          ) {
            console.error(`Failed to delete image: ${currentImgId}`);
          }
        }
      }

      const uploadResult = await uploadImage(
        req.file.path,
        userUploadFolder,
        user.name
          ? `${user.name.replace(/\s+/g, '')}-${Date.now()}`
          : `${Date.now()}`
      );
      user.image = uploadResult.secure_url;

      if (uploadResult.original_filename) {
        const deleteOriginalFileNameResult = await deleteOriginalFileName(
          uploadResult.original_filename
        );
        if (
          !deleteOriginalFileNameResult ||
          deleteOriginalFileNameResult?.deleted_counts?.[
            `food_delivery/${uploadResult.original_filename}`
          ]?.original === 0
        ) {
          console.error(
            `Failed to delete original file image: ${uploadResult.original_filename}`
          );
        }
      }
    }
    await user.save();
    return res.status(200).json({
      success: true,
      message: 'User information updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user info:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { loginUser, registerUser, getMe, updateUserInfo };
