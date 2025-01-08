import express from "express";
const router = express.Router();
import verifyToken from "../../middleware/authMiddleware.js";
import { filterDetails } from "../../controller/Admin/filterdetails.js";

router.get("/filterdetails", verifyToken, filterDetails);

export default router;
