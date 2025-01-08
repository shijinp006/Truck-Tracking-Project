import mysql from "mysql2";

// Create a connection pool with promise support
export const db = mysql
  .createPool({
    host: "localhost", // Database host
    user: "root", // MySQL user
    password: "password", // MySQL password
    database: "logistic project new", // Your database name
    waitForConnections: true, // Wait for a connection to become available
    connectionLimit: 10, // Set the maximum number of connections
    queueLimit: 0, // No limit for connection queue
  })
  .promise(); // Add `.promise()` to use promises

// close the connection pool
export const closeConnection = () => db.end();
