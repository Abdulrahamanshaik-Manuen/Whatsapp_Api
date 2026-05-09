import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL?.split('@')[1] || 'dcsfxv6g1',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local path to the file
 * @param {string} folder - Cloudinary folder name
 */
export const uploadToCloudinary = async (filePath, folder = 'whatsapp_templates') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default cloudinary;
