import express from "express";
const router = express.Router();
import userverifyToken from "../../middleware/userMiddleware.js";
import { filterusertripDetails } from "../../controller/User/userfilterdetails.js";

router.get("/filterdetails", userverifyToken, filterusertripDetails);

export default router;
