import { db } from "./db.js";

const ensureTableExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tripdetails(
      id INT AUTO_INCREMENT PRIMARY KEY,
      tripfrom VARCHAR(255) NOT NULL,
      tripto VARCHAR(255) NOT NULL,
      meterbefore INT DEFAULT 0,
      meterafter INT DEFAULT 0,
      mileage DECIMAL(10,2),
      fuelinstock DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      fuel DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      vehiclenumber VARCHAR(50),
      tripmode VARCHAR(100) NOT NULL,
      category VARCHAR(100),
      invoicedoc VARCHAR(255),
      invoicedoc2 VARCHAR(255),
      invoicedoc3 VARCHAR(255),
      meterbeforefile VARCHAR(255),
      meterafterfile VARCHAR(255),
      fuelinstockfile VARCHAR(255),
      filledfuelfile VARCHAR(255),
      filledfuelfile2 VARCHAR(255),
      mileagefile VARCHAR(255),
      mileagefile2 VARCHAR(255),
      credit INT DEFAULT 0,
      creditallowed INT DEFAULT 0,
      remark TEXT NULL,
      status VARCHAR(255) NULL,
      driverId INT NOT NULL,
      name VARCHAR(100),
    
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driverId) REFERENCES userdetails(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `;

  // List of columns to check and add
  // const columnsToCheck = [
  //   "filledfuelfile",
  //   "filledfuelfile2",
  //   "mileagefile",
  //   "mileagefile2",
  // ];

  try {
    // Step 1: Create 'tripdetails' table if it doesn't exist
    await db.query(createTableQuery);
    console.log("Trips table is ready.");

    // Step 2: Check and add missing columns individually
    // for (const column of columnsToCheck) {
    //   const checkColumnQuery = `
    //     SELECT COUNT(*) AS count
    //     FROM INFORMATION_SCHEMA.COLUMNS
    //     WHERE TABLE_NAME = 'tripdetails' AND COLUMN_NAME = '${column}';
    //   `;

    //   const result = await db.query(checkColumnQuery);
    //   if (result[0].count === 0) {
    //     // Column does not exist, add it
    //     const addColumnQuery = `
    //       ALTER TABLE tripdetails
    //       ADD COLUMN ${column} VARCHAR(200);
    //     `;
    //     await db.query(addColumnQuery);
    //     console.log(`Added missing column '${column}' to 'tripdetails' table.`);
    //   } else {
    //     // console.log(
    //     //   `Column '${column}' already exists in 'tripdetails' table.`
    //     // );
    //   }
    // }
  } catch (error) {
    console.error(
      "Error ensuring trips table and columns exist:",
      error.message
    );
  }
};

export default ensureTableExists;
