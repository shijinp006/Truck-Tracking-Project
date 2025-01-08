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

  try {
    await db.query(createTableQuery);
    console.log("Category table is ready.");
  } catch (error) {
    console.error("Error ensuring category table exists:", error);
  }
};

export default ensureTableExists;
