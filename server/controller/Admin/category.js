import ensureTableExists from "../../models/category.js";
import { db } from "../../models/db.js";

ensureTableExists();

// Helper function for querying the database
const queryAsync = async (query, params) => {
  const [results] = await db.execute(query, params);
  return results;
};

// Create a new category
export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (typeof name !== "string" || name.trim() === "") {
    // Handle invalid name
    console.error("Invalid name: It should be a non-empty string.");
  }

  // Check if category already exists
  const checkCategoryQuery = "SELECT * FROM categories WHERE name = ?";
  const existingCategory = await queryAsync(checkCategoryQuery, [name]);

  if (existingCategory.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Category Name already exists",
    });
  }

  // Insert new category into the database
  const insertCategoryQuery = "INSERT INTO categories (name) VALUES (?)";
  try {
    await queryAsync(insertCategoryQuery, [name]);
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error inserting category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// Get all categories
export const getCategory = async (req, res) => {
  try {
    const query = "SELECT * FROM categories";
    const results = await queryAsync(query);

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        data: results,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  const { id: id } = req.params;
  const categoryId = Number(id);

  if (typeof categoryId !== "number" || isNaN(categoryId) || categoryId <= 0) {
    // Handle invalid id
    console.error("Invalid id: It should be a positive number.");
  }

  console.log(categoryId, "id");

  // Check if the category exists in the database
  const checkCategoryQuery = "SELECT id FROM categories WHERE id = ?";
  const category = await queryAsync(checkCategoryQuery, [categoryId]);

  if (category.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Delete the category if it exists
  const deleteCategoryQuery = "DELETE FROM categories WHERE id = ?";
  try {
    await queryAsync(deleteCategoryQuery, [categoryId]);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

export const editCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id: id } = req.params;

    const categoryId = Number(id);

    if (
      typeof categoryId !== "number" ||
      isNaN(categoryId) ||
      categoryId <= 0
    ) {
      // Handle invalid id
      console.error("Invalid id: It should be a positive number.");
    }

    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Invalid Name: Name must be a non-empty string.");
    }

    console.log("Category Id:", categoryId, "Name:", name);

    // Check if the category exists
    const checkCategoryQuery = "SELECT * FROM categories WHERE id = ?";
    const results = await queryAsync(checkCategoryQuery, [categoryId]);

    if (results.length > 0) {
      // Update the category if it exists
      const updateQuery = "UPDATE categories SET name = ? WHERE id = ?";
      const updateResult = await queryAsync(updateQuery, [name, categoryId]);

      // Check if the update was successful
      if (updateResult.affectedRows > 0) {
        return res
          .status(200)
          .json({ message: "Category updated successfully." });
      } else {
        return res.status(400).json({ message: "Failed to update category." });
      }
    } else {
      return res.status(404).json({ message: "Category not found." });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the category." });
  }
};
