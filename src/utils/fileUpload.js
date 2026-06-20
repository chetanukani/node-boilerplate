import fs from "fs";
import path from "path";
import S3Service from "./s3.js";

/**
 * @description Handles file upload to either S3 or local storage
 * @param {Express.Multer.File} file
 * @param {string} folder - Folder name (e.g., 'category', 'product')
 * @returns {Promise<{url: string, localPath: string}>}
 */
export const handleFileUpload = async (file, folder, req = null) => {
  if (!file) return null;

  if (S3Service.isEnabled()) {
    // Upload to S3
    const fileName = `${Date.now()}_${file.originalname}`;
    const s3Key = `${folder}/${fileName}`;
    const relativePath = await S3Service.uploadFile(
      file.buffer,
      s3Key,
      file.mimetype
    );

    if (req) {
      req.uploadedFileKeys = req.uploadedFileKeys || [];
      req.uploadedFileKeys.push(relativePath);
    }

    return {
      url: relativePath,
    };
  } else {
    // Store locally
    const fileName = file.filename;
    const localPath = `${folder}/${fileName}`;

    return {
      url: localPath,
    };
  }
};

/**
 * @description Handles multiple files upload
 * @param {Express.Multer.File[]} files
 * @param {string} folder
 * @param {import("express").Request} req
 * @returns {Promise<Array>}
 */
export const handleMultipleFilesUpload = async (files, folder, req = null) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map((file) =>
    handleFileUpload(file, folder, req)
  );
  return Promise.all(uploadPromises);
};

/**
 * @description Deletes file from storage
 * @param {string} localPath - Path stored in DB
 * @returns {Promise<void>}
 */
export const deleteFile = async (localPath) => {
  if (!localPath) return;

  if (S3Service.isEnabled()) {
    await S3Service.deleteFile(localPath);
  } else {
    try {
      const fullPath = `public/images/${localPath}`;
      fs.unlinkSync(fullPath);
      console.log(`Local file deleted: ${fullPath}`);
    } catch (error) {
      console.error("Error deleting local file:", error);
    }
  }
};

/**
 * @description Gets full URL from stored path
 * @param {string} localPath
 * @returns {string}
 */
export const getFileUrl = (localPath) => {
  if (!localPath) return null;

  if (S3Service.isEnabled()) {
    return S3Service.getUrl(localPath);
  } else {
    return `${process.env.HOST_URL}/images/${localPath}`;
  }
};
