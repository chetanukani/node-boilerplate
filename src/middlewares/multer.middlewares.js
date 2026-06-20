import multer from "multer";
import path from "path";
import fs from "fs";
import S3Service from "../utils/s3.js";

const makeFilename = (originalname) => {
  let fileExtension = "";
  if (originalname.split(".").length > 1) {
    fileExtension = originalname.substring(originalname.lastIndexOf("."));
  }
  const filenameWithoutExtension = originalname
    .toLowerCase()
    .split(" ")
    .join("-")
    ?.split(".")[0];
  return (
    filenameWithoutExtension +
    Date.now() +
    Math.ceil(Math.random() * 1e5) +
    fileExtension
  );
};

export const uploadFor = (folderName) => {
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "files",
    String(folderName)
  );

  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, makeFilename(file.originalname));
    },
  });

  const memoryStorage = multer.memoryStorage();

  const storage = S3Service.isEnabled() ? memoryStorage : diskStorage;

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1000 * 1000, // 5MB
    },
  });
};

export default uploadFor;
