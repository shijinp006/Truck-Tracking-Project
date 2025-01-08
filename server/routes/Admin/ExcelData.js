import express from "express";
const router = express.Router();
import verifyToken from "../../middleware/authMiddleware.js";
import getExcelData from "../../controller/Admin/Exceldata.js";

router.get("/getexcel", verifyToken, getExcelData);

export default router;
