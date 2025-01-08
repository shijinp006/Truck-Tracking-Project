import { db } from "../../models/db.js";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET; // Ensure your secret is securely set in environment variables

const checkUser = async (req, res) => {
  console.log(secretKey, "jwt");

  // Function to execute queries asynchronously
  const queryAsync = async (query, params) => {
    try {
      const [results] = await db.execute(query, params);
      return results;
    } catch (error) {
      console.error("Database query error:", error.message);
      throw new Error("Database query failed");
    }
  };

  // Validate JWT secret
  if (!secretKey) {
    return res.status(500).json({ error: "JWT_SECRET not configured" });
  }

  try {
    const { userId } = req.body; // Extract userId from request body

    // Validate input
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid UserID provided" });
    }

    // Query to check if the user exists (using LIMIT for performance)
    const userQuery = "SELECT id, name FROM userdetails WHERE name = ?";
    const user = await queryAsync(userQuery, [userId]);

    if (user.length > 0) {
      const userDetails = { userId: user[0].id, username: user[0].name };

      // Generate JWT token (token expires in 1 hour)
      const token = jwt.sign(userDetails, secretKey, { expiresIn: "1h" });

      // Respond with token and success message
      return res.status(200).json({
        message: "Login successful",
        token,
      });
    } else {
      // If user doesn't exist
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default checkUser;
