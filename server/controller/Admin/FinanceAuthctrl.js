import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../models/db.js";
import ensureTableExists from "../../models/financelogin.js";

// Secret Key for JWT (use environment variable for security)
const secretKey = process.env.JWT_SECRET || "your_jwt_secret";

// Ensure the table exists before any operation
ensureTableExists();

// Helper to execute database queries
const executeQuery = async (query, params) => {
  try {
    return await db.execute(query, params);
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Database operation failed");
  }
};

// // Login Function
const financelogin = async (req, res) => {
  const { loginEmail, loginPassword } = req.body;
  console.log("email : ", loginEmail);

  if (!loginEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!loginPassword) {
    return res.status(400).json({ error: "Password is required" });
  }

  //validate the email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(loginEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Find the admin by email
    const [financeResult] = await executeQuery(
      "SELECT * FROM financelogin WHERE signupEmail = ?",
      [loginEmail]
    );

    if (financeResult.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const finance = financeResult[0];

    // Compare the password with bcrypt
    const isMatch = await bcrypt.compare(loginPassword, finance.signupPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: finance.id, email: finance.signupEmail },
      secretKey,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    return res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

// Middleware to Authenticate JWT Token

// Example of a Protected Route
// const getUserData = (req, res) => {
//     res.status(200).json({
//         message: 'Protected route accessed',
//         user: req.user
//     });
// };

// Auth Controller Export
const FinanceAuthController = {
  // signup,
  financelogin,
  // getUserData
};

export default FinanceAuthController;
