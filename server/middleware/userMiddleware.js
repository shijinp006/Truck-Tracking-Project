import jwt from "jsonwebtoken";

// Middleware to verify if the admin is authenticated
const userverifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  console.log("token", token);

  if (!token) {
    return res.status(401).json({ message: "Access denied, please log in." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.admin = decoded; // Attach the admin data to the request object
    next();
  } catch (error) {
    console.log(error);

    if (error.name === "TokenExpiredError") {
      // Handle token expiration
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    // Handle other token-related errors
    res.status(400).json({ message: "Invalid token, please log in again." });
  }
};

export default userverifyToken;
