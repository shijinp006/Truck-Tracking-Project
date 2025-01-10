import { db } from "./db.js";

const ensureTableExists = async () => {
  const createTableQuery = ` CREATE TABLE IF NOT EXISTS vehicledetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicleNumber VARCHAR(50) NOT NULL,
    vehicleName VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  try {
    await db.query(createTableQuery);
    console.log("Vehicle table is ready.");
  } catch (error) {
    console.error("Error ensuring category table exists:", error);
  }
};

export default ensureTableExists;
