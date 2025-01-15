import jwt from "jsonwebtoken";

// Middleware to verify if the admin is authenticated
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  console.log(token, "ty");

  if (!token) {
    return res.status(401).json({ message: "Access denied, please log in." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // Attach the admin data to the request object
    next();
  } catch (error) {
    // If token expired or invalid, catch error and send response
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }
    res.status(400).json({ message: "Invalid token, please log in again." });
  }
};

export default verifyToken;
