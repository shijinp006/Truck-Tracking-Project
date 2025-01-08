import express from "express"; // Import express

const router = express.Router();

import edittrip from "../../controller/Admin/Edittrip.js";
import { upload, uploadAndCompress } from "../../middleware/multer.js";

import verifyToken from "../../middleware/authMiddleware.js";

router.put(
  "/edittrip/:tripId",
  verifyToken,
  upload.single("invoicedoc"),
  uploadAndCompress,
  edittrip
);

export default router;
