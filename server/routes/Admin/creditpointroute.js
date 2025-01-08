import express from "express";
const router = express.Router();

import {
  addCreditPoint,
  getCreditpoint,
} from "../../controller/Admin/addcreditpoint.js";
import verifyToken from "../../middleware/authMiddleware.js";

router.post("/addcreditpoint/:tripId", verifyToken, addCreditPoint);
router.post("/creditclime/:id", verifyToken, getCreditpoint);

export default router;
