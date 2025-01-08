import express from "express";
const router = express.Router();
import userverifyToken from "../../middleware/userMiddleware.js";
import { filterDetails } from "../../controller/User/userfilterdetails.js";
import userverifyToken from "../../middleware/userMiddleware.js";

router.get("/filterdetails", userverifyToken, filterDetails);

export default router;
