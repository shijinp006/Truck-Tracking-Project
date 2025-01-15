import {
  createCategory,
  getCategory,
  // deleteCategory,
  editCategory,
} from "../../controller/Admin/category.js";
import express from "express";
import verifyToken from "../../middleware/authMiddleware.js";

const router = express.Router();

// Add category route
router.post("/addCategory", verifyToken, createCategory);

// Get categories route
router.get("/getcategory", verifyToken, getCategory);

//delete categories route
// router.delete("/deletecategory/:id", verifyToken, deleteCategory);

// edit category
router.put("/editcategory/:id", verifyToken, editCategory);

export default router;
