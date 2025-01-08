import express from "express";

const router = express.Router();
import { upload, uploadAndCompress } from "../../middleware/multer.js";
import {
  uploadMultiple,
  uploadAndCompressMultiple,
} from "../../middleware/multipplemulter.js";

import {
  tripAssigned,
  tripCancel,
  tripComplete,
} from "../../controller/User/tripstatus.js";

import userverifyToken from "../../middleware/userMiddleware.js";

router.post(
  "/tripassigned/:tripId",
  userverifyToken,
  upload.single("meterbeforefile"),
  uploadAndCompress,
  tripAssigned
);

router.post("/usertripcancel/:id", userverifyToken, tripCancel);
router.post(
  "/completeTrip/:tripId",
  userverifyToken, // Middleware to verify the user's token
  uploadMultiple.fields([
    { name: "invoicedoc", maxCount: 1 }, // Single file for "invoicedoc"
    { name: "meterafterfile", maxCount: 1 }, // Single file for "meterafterfile"
  ]),
  uploadAndCompressMultiple, // Middleware to compress uploaded images
  (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(); // Pass to the `tripComplete` handler
  },
  tripComplete // Final middleware to handle trip completion logic
);

export default router;
