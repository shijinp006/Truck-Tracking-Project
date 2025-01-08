import { db } from "./db.js";

const ensureTableExists = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS userdetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE, -- Ensure 'name' is unique
    licenseDoc VARCHAR(255), -- Optional field for license document
    phoneNumber VARCHAR(20) NOT NULL, -- Phone number is required
    password VARCHAR(255) NOT NULL, -- Password field added
    creditpoint INT DEFAULT 0, -- Default value for credit points
    creditpointreceived INT DEFAULT 0, -- Default value for received credit points
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-updated timestamp
);
    `;

  try {
    await db.query(createTableQuery);
    console.log("Drivers table is ready.");
  } catch (error) {
    console.error("Error ensuring category table exists:", error);
  }
};

export default ensureTableExists;
