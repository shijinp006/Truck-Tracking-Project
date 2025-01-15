import { db } from "../../models/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    const { userId, password } = req.body; // Extract userId and password from request body
    console.log(password, "password");

    // Validate input
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid UserID provided" });
    }

    // Query to check if the user exists and fetch the hashed password
    const userQuery =
      "SELECT id, phoneNumber, password FROM userdetails WHERE phoneNumber = ?";
    const user = await queryAsync(userQuery, [userId]);

    if (user.length > 0) {
      const userDetails = {
        userId: user[0].id,
        username: user[0].phoneNumber,
        password: user[0].password, // Hashed password from database
      };

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, userDetails.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Generate JWT token (token expires in 1 hour)
      const token = jwt.sign(
        { userId: userDetails.userId, username: userDetails.username },
        secretKey,
        { expiresIn: "24h" }
      );

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
