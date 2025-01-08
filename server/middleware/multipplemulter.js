import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload directory path
// const uploadDir = path.join(__dirname, "../public/uploads");
const uploadDir = path.join(__dirname, "../public/uploads");
console.log(uploadDir);

// Ensure that the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the uploadDir variable for consistency
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    ); // File name will be the timestamp with original file extension
  },
});

const uploadMultiple = multer({
  storage: storage,
  limits: { fileSize: 1073741824 }, // Set file size limit to 1 GB (1 GB = 1073741824 bytes)
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/; // Allowed file types (images and PDFs)

    const mimetype = filetypes.test(file.mimetype); // Check mime type
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    ); // Check file extension

    if (mimetype && extname) {
      return cb(null, true); // Allow the file
    } else {
      cb(new Error("Error, only Images and PDFs are allowed!")); // Pass an error with a message
    }
  },
});

// Compress the image after upload
const compressImage = async (filePath) => {
  try {
    // Check if the file is an image before attempting compression
    const extname = path.extname(filePath).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(extname)) {
      return;
    }

    const compressedFilePath = path.join(
      uploadDir,
      `compressed_${path.basename(filePath)}`
    );

    // Compress the image using sharp
    await sharp(filePath)
      .resize(800) // Resize the image (optional)
      .jpeg({ quality: 50 }) // Set compression quality (80%)
      .toFile(compressedFilePath); // Save the compressed image

    return compressedFilePath;
  } catch (error) {
    console.error("Error compressing image:", error.message);
    throw error; // Rethrow the error to be handled in middleware
  }
};

// Middleware to handle file upload and compression
// Middleware to handle multiple file uploads and compression
const uploadAndCompressMultiple = async (req, res, next) => {
  try {
    // Check if files exist
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files uploaded!" });
    }

    // Iterate over uploaded files for compression
    const compressionPromises = [];
    for (const fieldName in req.files) {
      req.files[fieldName].forEach((file) => {
        const filePath = path.join(uploadDir, file.filename); // Uploaded file's path
        compressionPromises.push(compressImage(filePath)); // Add compression promise
      });
    }

    // Wait for all images to be compressed
    const compressedFiles = await Promise.all(compressionPromises);

    // Add compressed file paths to the request for further processing
    req.compressedFiles = compressedFiles;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error compressing images:", error.message);
    res.status(500).json({ error: "Error compressing images" });
  }
};

export { uploadMultiple, uploadAndCompressMultiple };
