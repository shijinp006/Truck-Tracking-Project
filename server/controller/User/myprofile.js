import { db } from "../../models/db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.USER_JWT_SECRET || "your_secret_key";

const myprofile = async (req, res) => {
  const queryAsync = async (query, params) => {
    try {
      const [results] = await db.execute(query, params);
      return results;
    } catch (error) {
      console.error("Database query error:", error.message);
      throw new Error("Database query failed");
    }
  };

  console.log("JWT_SECRET:", JWT_SECRET);

  try {
    // Extract token from headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.userId) {
      console.log("Invalid token payload:", decoded);
      return res.status(400).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    const userId = decoded.userId;

    // Fetch user details
    const checkQuery = "SELECT * FROM userdetails WHERE id = ?";
    console.log("Executing query:", checkQuery, "with params:", [userId]);
    const results = await queryAsync(checkQuery, [userId]);

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        data: results,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
  } catch (error) {
    console.error("Error during request:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
      error: error.message,
    });
  }
};

export default myprofile;
