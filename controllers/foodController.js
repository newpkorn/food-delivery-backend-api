import foodModel from "../models/foodModel.js";
import fs from "fs";

// add food item
const addFoodItem = async (req, res) => {
  let image_filename = `${req.file.filename}`;
  const { name, description, price, category } = req.body;

  const food = new foodModel({
    name,
    description,
    price,
    category,
    image: image_filename,
  });

  try {
    await food.save();
    res.status(201).json({success: true, message: "Food item added successfully" });
  } catch (error) {
    res.status(500).json({succuss: false, message: "Error adding food item" });
  }
}

// all foods list
const getAllFoodItems = async (req, res) => {
  try {
    const foods = await foodModel.find();
    res.status(200).json({success: true, data: foods });
  } catch (error) {
    res.status(500).json({success: false, message: "Error fetching food items" });
  }
}

// update food item
const updateFoodItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;
  let image_filename = req.file ? req.file.filename : null;

  // Step 1: Retrieve the old image path from the database
  const FoodItem = await foodModel.findById(id);
  const currentImagePath = FoodItem.image;
  if (!FoodItem) {
    return res.status(404).json({ success: false, message: "Food item not found" });
  }

  try {
    // Step 2: Delete the old image
    if (image_filename) {
      fs.unlink(`uploads/${currentImagePath}`, (err) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully: ", currentImagePath);
        }
      });
    }

    // Step 3: Update the food item in the database
    const updatedFoodItem = await foodModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        image: image_filename || currentImagePath,
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!updatedFoodItem) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    } else {
      return res.status(200).json({ success: true, message: "Food item updated successfully" });
    }

  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: "Error updating food item" });
  }
};

// remove food item
const removeFoodItem = async (req, res) => {
  const { id } = req.params;
  try {
    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }
    
    const imagePath = `uploads/${food.image}`;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image file:", err);
      }
    });
    
    await foodModel.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: "Food item removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing food item" });
  }
}



export { addFoodItem, getAllFoodItems, removeFoodItem, updateFoodItem };