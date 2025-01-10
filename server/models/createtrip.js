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
    fuel DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    vehiclenumber VARCHAR(50) ,
    tripmode VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    invoicedoc VARCHAR(255),
    invoicedoc2 VARCHAR(255),
    invoicedoc3 VARCHAR(255),
    meterbeforefile VARCHAR(255),
    meterafterfile VARCHAR(255),
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

  try {
    await db.query(createTableQuery);
    console.log("Trips table is ready.");
  } catch (error) {
    console.error("Error ensuring trips table exists:", error.message);
  }
};

export default ensureTableExists;
