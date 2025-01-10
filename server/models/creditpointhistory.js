// ensureTable.js
import { db } from "./db.js";

const ensureTableExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS creditpoint_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driverId INT  NULL,
    tripId INT  NULL,
    debitCreditPoint DECIMAL(10, 2)  NULL,  -- Assuming it's a decimal value for points (credit or debit)
    creditCreditPoint DECIMAL(10, 2)  NULL, -- Assuming it's a decimal value for points (credit)
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- To record when the transaction happened
    FOREIGN KEY (driverId) REFERENCES userdetails(id),  -- Assuming there is a 'drivers' table with 'id' as the primary key
    FOREIGN KEY (tripId) REFERENCES tripdetails(id)       -- Assuming there is a 'trips' table with 'id' as the primary key
);
  `;

  try {
    await db.query(createTableQuery);
    console.log("Creditpoint history  table is ready.");
  } catch (error) {
    console.error("Error ensuring category table exists:", error);
  }
};

export default ensureTableExists;
