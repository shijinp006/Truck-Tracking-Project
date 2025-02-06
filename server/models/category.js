// ensureTable.js
import { db } from "./db.js";

const ensureTableExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // const checkColumnQuery = `
  //   SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
  //   WHERE TABLE_NAME = 'categories' AND COLUMN_NAME = 'status';
  // `;

  // const addColumnQuery = `
  //   ALTER TABLE categories ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  // `;

  try {
    // Create table if not exists
    await db.query(createTableQuery);
    console.log("Category table is ready.");

    // Check if column exists
    // const [rows] = await db.query(checkColumnQuery);
    // if (rows[0].count === 0) {
    //   await db.query(addColumnQuery);
    //   console.log("Column 'status' added successfully.");
    // } else {
    //   console.log("Column 'status' already exists.");
    // }
  } catch (error) {
    console.error("Error ensuring category table exists:", error);
  }
};

export default ensureTableExists;
