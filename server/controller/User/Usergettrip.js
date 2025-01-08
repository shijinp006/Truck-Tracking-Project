import { db } from "../../models/db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET; // Replace with a secure value
const queryAsync = async (query, params) => {
  const [results] = await db.execute(query, params);
  return results;
};
export const getUserTrip = async (req, res) => {
  // Extract and verify JWT token from headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId; // Extract userId from decoded token
    console.log(userId, "userId");

    // Base query to fetch user trips
    let checkQuery = "SELECT * FROM tripdetails WHERE driverid = ?";
    const values = [userId];

    // Execute the query
    const tripResults = await queryAsync(checkQuery, values);
    const status = tripResults[0].status;
    console.log(status, "status");

    // Return results if trips are found
    if (tripResults.length > 0 && status !== "cancelled") {
      return res.status(200).json({
        success: true,
        data: tripResults,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No trips found for the user",
      });
    }
  } catch (error) {
    console.error("Error fetching user trips:", error.message);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserfilterTrip = async (req, res) => {
  const { status } = req.query;
  console.log(status, "status");

  // Extract and verify JWT token from headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId; // Extract userId from decoded token
    console.log(userId, "userId");

    // Base query to fetch user trips
    let checkQuery = "SELECT * FROM tripdetails WHERE driverid = ?";
    const values = [userId];

    // Add status filter if provided
    if (status) {
      checkQuery += " AND status = ?";
      values.push(status);
    }

    console.log("Final Query:", checkQuery, "Values:", values);

    // Execute the query
    const tripResults = await queryAsync(checkQuery, values);

    console.log(tripResults, "trip");

    // Return results if trips are found

    return res.status(200).json({
      success: true,
      data: tripResults,
    });
  } catch (error) {
    console.error("Error fetching user trips:", error.message);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
