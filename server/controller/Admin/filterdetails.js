import { db } from "../../models/db.js";

const queryAsync = async (query, params) => {
  try {
    const [results] = await db.execute(query, params);
    return results;
  } catch (err) {
    console.error("Database query error:", err);
    throw new Error("Database operation failed.");
  }
};

export const filterDetails = async (req, res) => {
  let {
    status,
    sortField,
    sortOrder,
    page,
    limit,
    tripfrom,
    category,
    tripto,
    driverName,
    tripMode,
    date,
  } = req.query;

  // Validate status: allowed values (add more if necessary)
  const validStatuses = [
    "created",
    "submitted",
    "cancelled",
    "completed",
    "assigned",
  ];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values are ${validStatuses.join(
        ", "
      )}.`,
    });
  }

  // Validate sortField: allowed fields (add more if necessary)

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

  // Validate sortOrder: should be "asc" or "desc"

  if (sortOrder && !validSortOrders.includes(sortOrder)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid sortOrder. It should be either "asc" or "desc".',
    });
  }

  // Validate page: should be a positive integer
  if (page && (isNaN(page) || parseInt(page) <= 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid page number. It should be a positive integer.",
    });
  }

  // Validate limit: should be a positive integer
  if (limit && (isNaN(limit) || parseInt(limit) <= 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid limit. It should be a positive integer.",
    });
  }

  let query = `SELECT * FROM tripdetails WHERE 1=1`;
  const values = [];

  // Add filters dynamically

  if (status) {
    query += ` AND status = ?`;
    values.push(status);
  }
  if (tripfrom) {
    tripfrom = tripfrom.trim(); // Trim the value of tripfrom
    query += ` AND LOWER(tripfrom) LIKE LOWER(?)`; // Case-insensitive comparison
    values.push(`%${tripfrom}%`); // % on both sides for partial match
  }

  if (category) {
    category = category.trim();
    query += ` AND category = ?`;
    values.push(category);
  }
  if (tripto) {
    tripto = tripto.trim();
    query += ` AND LOWER(tripto) LIKE LOWER(?)`; // Case-insensitive comparison
    values.push(`%${tripto}%`); // % on both sides for partial match
  }
  if (tripMode) {
    tripMode = tripMode.trim();
    query += ` AND tripmode = ?`;
    values.push(tripMode);
  }
  if (driverName) {
    driverName = driverName.trim();
    query += ` AND name = ?`;
    values.push(driverName);
  }
  if (date) {
    query += ` AND DATE(created_at) = ?`; // Use the DATE() function to compare only the date part
    values.push(date);
  }

  // Add sorting
  query += ` ORDER BY ${sortBy} ${orderBy}`;

  limit = limit ? parseInt(limit) : 10; // Default limit
  const offset = (page - 1) * limit;

  try {
    // Get total count of filtered results
    const countQuery =
      `SELECT COUNT(*) AS total FROM tripdetails WHERE 1=1` +
      (status ? ` AND status = ?` : "") +
      (tripfrom ? ` AND TRIM(LOWER(tripfrom)) LIKE TRIM(LOWER(?))` : "") +
      (category ? ` AND category = ?` : "") +
      (tripto ? ` AND TRIM(LOWER(tripto)) LIKE TRIM(LOWER(?))` : "") +
      (tripMode ? ` AND tripmode = ?` : "") +
      (driverName ? ` AND name = ?` : "") +
      (date ? ` AND DATE(created_at) = ?` : "");

    const countResults = await queryAsync(countQuery, values);
    const totalItems = countResults[0].total;
    console.log(totalItems, "total");

    // Add pagination to the main query
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // Execute the main query
    const results = await queryAsync(query, values);

    // const tripfrom = results[0].tripfrom;
    // console.log(tripfrom, "trip");

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
