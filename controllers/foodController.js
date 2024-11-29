import { uploadImage, deleteOriginalFileName, deleteImage } from "../config/cloudinary.js";
import foodModel from "../models/foodModel.js";
import { extractPublicId, extractPublicIdNumber } from "../utils/cloudinaryUtils.js";

const foodUploadFolder = 'food_images';
// add food item
const addFoodItem = async (req, res) => {

    const { name, description, price, category } = req.body;
    let imageUrl;

    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, foodUploadFolder);
      imageUrl = uploadResult.secure_url;

      if (uploadResult.original_filename) {
        await deleteOriginalFileName(uploadResult.original_filename);
      }
    }

    const food = new foodModel({
        name,
        description,
        price,
        category,
        image: imageUrl || null,
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

  try {
    const FoodItem = await foodModel.findById(id);
    if (!FoodItem) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    let updatedFields = {
      name,
      description,
      price,
      category,
      updated_at: new Date(),
    };

    if (req.file && req.file.path) {
      const currentImage = FoodItem.image;

      const currentImgId = extractPublicIdNumber(currentImage);

      // Delete old image if it exists
      if (currentImgId) {
        const deleteOldImageResult = await deleteImage(currentImgId, foodUploadFolder);

        const currentImgPath = extractPublicId(currentImage);

        if (deleteOldImageResult?.deleted_counts[`${currentImgPath}`]?.original > 0) {
          console.log(`Ole image ID: ${currentImgId} was deleted successfully.`);
        } else {
          console.error(`Failed to delete old image ID: ${currentImgId}.`);
        }
      }

      // Upload new image
      const uploadResult = await uploadImage(req.file.path, foodUploadFolder);
      updatedFields.image = uploadResult.secure_url;
      console.log('New image URL uploaded:', uploadResult.secure_url);

      if (uploadResult.original_filename) {
        const deleteOriginalFileNameResult = await deleteOriginalFileName(uploadResult.original_filename);

        if (deleteOriginalFileNameResult?.deleted_counts[`food_delivery/${uploadResult.original_filename}`]?.original > 0) {
          console.log(`Image riginal file name ${uploadResult.original_filename} was deleted successfully.`);
        } else {
          console.error(`Failed to delete image riginal filename ${uploadResult.original_filename}.`);
        }
      }
    } else {
      updatedFields.image = FoodItem.image;
    }

    const updatedFoodItem = await foodModel.findByIdAndUpdate(id, updatedFields, { new: true });
    if (!updatedFoodItem) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    return res.status(200).json({ success: true, message: "Food item updated successfully", foodItem: updatedFoodItem });

  } catch (error) {
    console.error("Error updating food item:", error);
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

    const foodImage = food.image;
    if (foodImage) {
      const currentImgId = extractPublicIdNumber(foodImage);
      console.log('current image ID: ', currentImgId);

      if (currentImgId) {
        const deleteImageResult = await deleteImage(currentImgId, foodUploadFolder);
        console.log('deleteImageResult: ', deleteImageResult);

        const currentImgPath = extractPublicId(foodImage);
        console.log('currentImgPath: ', currentImgPath);

        
        if (deleteImageResult?.deleted_counts?.[`${currentImgPath}`]?.original > 0) {
          console.log(`Image ${currentImgId} was deleted successfully.`);
        } else {
          console.error(`Failed to delete image ${currentImgId}.`);
        }
      }
    }

    await foodModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Food item removed successfully" });

  } catch (error) {
    console.error("Error removing food item:", error.message); // Debugging error
    res.status(500).json({ success: false, message: "Error removing food item" });
  }
};





export { addFoodItem, getAllFoodItems, removeFoodItem, updateFoodItem };