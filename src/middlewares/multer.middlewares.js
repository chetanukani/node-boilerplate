import multer from "multer";
import path from "path";
import fs from "fs";
import S3Service from "../utils/s3.js";

// Base upload directory inside the public folder
const uploadDir = path.join(process.cwd(), "public", "images");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Priority: explicit `req.uploadFolder` (set by route middleware) -> router mount baseUrl -> fallback 'misc'
    const folderName =
      (req && req.uploadFolder) ||
      (() => {
        const baseUrl = req.baseUrl || "";
        const parts = baseUrl.split("/").filter(Boolean);
        return parts.length ? parts[parts.length - 1] : "misc";
      })();

    const destinationDir = path.join(uploadDir, String(folderName));
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    cb(null, destinationDir);
  },
  // Store file in a .png/.jpeg/.jpg format instead of binary
  filename: function (req, file, cb) {
    let fileExtension = "";
    if (file.originalname.split(".").length > 1) {
      fileExtension = file.originalname.substring(
        file.originalname.lastIndexOf(".")
      );
    }
    const filenameWithoutExtension = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-")
      ?.split(".")[0];
    cb(
      null,
      filenameWithoutExtension +
        Date.now() +
        Math.ceil(Math.random() * 1e5) + // avoid rare name conflict
        fileExtension
    );
  },
});

// Memory storage for S3 upload
const memoryStorage = multer.memoryStorage();

// Middleware responsible to read form data and upload the File object to the mentioned path
export const upload = multer({
  storage: S3Service.isEnabled() ? memoryStorage : storage,
  limits: {
    fileSize: 5 * 1000 * 1000, // 5MB
  },
});
