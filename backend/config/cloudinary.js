import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL?.split('@')[1] || 'dcsfxv6g1',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (filePath, folder = 'whatsapp_api/contacts') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary: Upload failed!', error.message);
    throw error;
  }
};

export default cloudinary;
