import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const mainFolder = 'food_delivery';

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create disk storage for uploading images.
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: mainFolder,
        format: async (req, file) => 'jpg',
        public_id: async (req, file) => Date.now().toString(),
        overwrite: true,
    },
});

export const upload = multer({ storage });

export const uploadImage = async (file, folder, fileName) => {
    try {
        const finalFileName = fileName || Date.now().toString();

        const uploadResult = await cloudinary.uploader.upload(file, {
            folder: `${mainFolder}/${folder}`,
            public_id: finalFileName,
            overwrite: true,
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
            ],
        });

        return uploadResult;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

export const deleteOriginalFileName = async (original_filename) => {
    try {
        const deleteResult = await cloudinary.api.delete_resources(
            `${mainFolder}/${original_filename}`,
            {
                type: 'upload',
                resource_type: 'image',
            }
        );
        return deleteResult;
    } catch (error) {
        console.error(
            'Error deleting original filename from Cloudinary:',
            error
        );
        throw error;
    }
};

export const deleteImage = async (publicId, folder) => {
    try {
        const deleteResult = await cloudinary.api.delete_resources(
            `${mainFolder}/${folder}/${publicId}`,
            {
                type: 'upload',
                resource_type: 'image',
            }
        );
        return deleteResult;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};
