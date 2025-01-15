import { db } from "../../models/db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const queryAsync = async (query, params) => {
  try {
    const [results] = await db.execute(query, params);
    return results;
  } catch (err) {
    console.error("Database query error:", err);
    throw new Error("Database operation failed.");
  }
};

export const filterusertripDetails = async (req, res) => {
  let { sortField, sortOrder, page, limit } = req.query;

  console.log("Fetching 'created' status trips for non-logged-in users");

  // Validate sortField: allowed fields
  const validSortFields = ["id", "name", "status", "driver", "tripmode"];
  const validSortOrders = ["ASC", "DESC"];

  const sortBy = validSortFields.includes(sortField) ? sortField : "id"; // Default to 'id'
  const orderBy = validSortOrders.includes(sortOrder) ? sortOrder : "DESC"; // Default to 'DESC'

  if (sortField && !validSortFields.includes(sortField)) {
    return res.status(400).json({
      success: false,
      message: `Invalid sortField. Allowed values are ${validSortFields.join(
        ", "
      )}.`,
    });
  }

  if (sortOrder && !validSortOrders.includes(sortOrder)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid sortOrder. It should be either "asc" or "desc".',
    });
  }

  // Validate page and limit
  if (page && (isNaN(page) || parseInt(page) <= 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid page number. It should be a positive integer.",
    });
  }

  if (limit && (isNaN(limit) || parseInt(limit) <= 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid limit. It should be a positive integer.",
    });
  }

  // Get the JWT token from the request headers
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Token is missing." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.userId) {
      console.log("Invalid token payload:", decoded);
      return res.status(400).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    const userId = decoded.userId;

    // Build the query to fetch trips that do not belong to the logged-in user
    let query = `SELECT * FROM tripdetails WHERE status = ? AND driverId != ?`;
    const values = ["created", userId]; // Exclude trips of the logged-in user

    // Add sorting
    query += ` ORDER BY ${sortBy} ${orderBy}`;

    limit = limit ? parseInt(limit) : 10; // Default limit
    const offset = (page - 1) * limit;

    // Get total count of filtered results
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM tripdetails 
      WHERE status = ? AND driverId != ?
    `;
    const countResults = await queryAsync(countQuery, values);
    const totalItems = countResults[0].total;

    // Add pagination to the main query
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // Execute the main query
    const results = await queryAsync(query, values);

    res.status(200).json({
      success: true,
      data: results, // Filtered and paginated data
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching filtered details:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trip details.",
    });
  }
};
