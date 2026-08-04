// backend\src\modules\tenants\services\cloudinary.service.js
import streamifier from "streamifier";
import cloudinary from "../../../config/cloudinary.js";

export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tenants" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};