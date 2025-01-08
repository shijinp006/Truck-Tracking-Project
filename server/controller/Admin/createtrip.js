import { db } from "../../models/db.js";
import ensureTableExists from "../../models/createtrip.js";

ensureTableExists();
const queryAsync = async (query, params) => {
  const [results] = await db.execute(query, params);
  return results;
};
// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const {
      tripfrom,
      tripto,
      tripmode,
      category,
      remark,
      status,
      driverid,
      count,
    } = req.body;

    console.log(count, "count");

    if (!count || count <= 0) {
      return res.status(400).json({
        success: false,
        message: "Count must be a positive integer.",
      });
    }

    // Validate input fields
    if (!tripfrom || !tripto || !driverid) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Please provide all necessary details.",
      });
    }

    const Name = driverid;

    const checkQuery = "SELECT id, name FROM userdetails WHERE name = ?";
    const [idRow] = await queryAsync(checkQuery, [Name]);

    if (!idRow || !idRow.id) {
      return res.status(400).json({
        success: false,
        message: "Driver not found in userdetails table.",
      });
    }

    const driverId = idRow.id;
    const name = idRow.name;

    const insertQuery =
      "INSERT INTO tripdetails (tripfrom, tripto, tripmode, category, remark, status, driverId, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    const createdTrips = [];
    const errors = [];

    // Insert the new trips
    for (let i = 0; i < count; i++) {
      try {
        const result = await queryAsync(insertQuery, [
          tripfrom,
          tripto,
          tripmode,
          category,
          remark,
          status,
          driverId,
          name,
        ]);

        createdTrips.push(result.insertId);
      } catch (error) {
        errors.push({
          message: `Error inserting trip #${i + 1} into database.`,
          error: error.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `${createdTrips.length} trip(s) created successfully.`,
      tripIds: createdTrips,
      errors: errors.length > 0 ? errors : null,
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating trip.",
      error: error.message,
    });
  }
};

// Get all trip details
// export const getTrips = async (req, res) => {
//   let { sortField, sortOrder, page, limit } = req.query;

//   console.log("Fetching trips");

//   const validSortFields = ["id", "name", "status", "driver", "tripmode"];
//   const validSortOrders = ["ASC", "DESC"];

//   const sortBy = validSortFields.includes(sortField) ? sortField : "id"; // Default to 'id'
//   const orderBy = validSortOrders.includes(sortOrder) ? sortOrder : "DESC"; // Default to 'DESC'

//   limit = limit ? parseInt(limit) : 10; // Default limit
//   const offset = (page - 1) * limit || 0;

//   try {
//     // Get total count of all results
//     const countQuery = `SELECT COUNT(*) AS total FROM tripdetails`;
//     const countResults = await queryAsync(countQuery);
//     const totalItems = countResults[0].total;

//     // Add pagination to the main query
//     const query = `
//       SELECT * FROM tripdetails
//       ORDER BY ${sortBy} ${orderBy}
//       LIMIT ${limit} OFFSET ${offset}
//     `;

//     // Execute the main query
//     const results = await queryAsync(query);

//     res.status(200).json({
//       success: true,
//       data: results, // Paginated data
//       totalItems,
//       totalPages: Math.ceil(totalItems / limit),
//       currentPage: page ? parseInt(page) : 1,
//     });
//   } catch (err) {
//     console.error("Error fetching trip details:", err.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch trip details.",
//     });
//   }
// };

export const deleteTrip = async (req, res) => {
  const id = req.params.id; // Correct way to access trip ID from URL

  const tripId = Number(id);

  if (typeof tripId !== "number" || isNaN(tripId) || tripId <= 0) {
    res
      .status(400)
      .json({ error: "Invalid tripId. It must be a positive number." });
    return;
  }

  const query = "SELECT * FROM tripdetails WHERE id = ?";
  const tripExists = await queryAsync(query, [tripId]);

  if (tripExists.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Trip not found.",
    });
  }
  const trip = tripExists[0];
  const existingtripCredit = trip.credit;
  const driverId = trip.driverId;

  console.log(driverId, "drivercjss");

  const checkDriverQuery = "SELECT * FROM userdetails WHERE id = ?";
  const driverExists = await queryAsync(checkDriverQuery, [driverId]);
  console.log(driverExists, "dfdsf");

  if (driverExists.length === 0) {
    // Driver does not exist
    return res.status(404).json({ message: "Driver not found." });
  }

  const driverCredit = driverExists[0].creditpoint;
  console.log(driverCredit, "driverCredit");

  // Ensure driver has enough credit to cancel the trip
  // if (driverCredit < existingtripCredit) {
  //   return res.status(400).json({
  //     message: "Driver does not have enough credit to cancel the trip.",
  //   });
  // }

  // Calculate the new credit for the driver
  const updatedCredit = driverCredit - existingtripCredit;
  console.log(updatedCredit, "updated credit");

  // Update the driver's credit
  const updateDriverQuery =
    "UPDATE userdetails SET creditpoint = ? WHERE id = ?";
  await queryAsync(updateDriverQuery, [updatedCredit, driverId]);

  const deleteTripQuery = "DELETE FROM tripdetails WHERE id = ?";

  try {
    await queryAsync(deleteTripQuery, [tripId]);
    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Trip:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Trip",
    });
  }
};

export const tripCancel = async (req, res) => {
  const id = req.params.id;

  const tripId = Number(id);
  console.log(tripId, typeof tripId, "id");

  if (typeof tripId !== "number" || isNaN(tripId) || tripId <= 0) {
    res
      .status(400)
      .json({ error: "Invalid tripId. It must be a positive number." });
    return;
  }

  try {
    // Check if the trip exists
    const checkQuery = "SELECT * FROM tripdetails WHERE id = ?";
    const tripExists = await queryAsync(checkQuery, [tripId]);

    if (tripExists.length === 0) {
      // Trip does not exist
      return res.status(404).json({ message: "Trip not found." });
    }

    const trip = tripExists[0];
    const existingtripCredit = trip.credit;
    const driverId = trip.driverId;
    console.log(driverId, "driver");
    console.log(existingtripCredit, "credit");

    // Fetch the driver's details and current credit
    const checkDriverQuery = "SELECT * FROM userdetails WHERE id = ?";
    const driverExists = await queryAsync(checkDriverQuery, [driverId]);

    if (driverExists.length === 0) {
      // Driver does not exist
      return res.status(404).json({ message: "Driver not found." });
    }

    const driverCredit = driverExists[0].creditpoint;

    // Ensure driver has enough credit to cancel the trip
    // if (driverCredit < existingtripCredit) {
    //   return res.status(400).json({
    //     message: "Driver does not have enough credit to cancel the trip.",
    //   });
    // }

    // Calculate the new credit for the driver
    const updatedCredit = driverCredit - existingtripCredit;

    // Update the driver's credit
    const updateDriverQuery =
      "UPDATE userdetails SET creditpoint = ?  WHERE id = ?";
    await queryAsync(updateDriverQuery, [updatedCredit, driverId]);

    // Update the trip status and set credit to 0
    const creditpoint = 0;
    const status = "cancelled";
    const updateQuery =
      "UPDATE tripdetails SET status = ?, credit = ? WHERE id = ?";
    await queryAsync(updateQuery, [status, creditpoint, tripId]);

    return res.status(200).json({
      message: "Trip status updated to 'Cancelled'.",
      success: true,
    });
  } catch (error) {
    console.error("Error cancelling trip:", error.message);
    return res
      .status(500)
      .json({ message: "An error occurred while cancelling the trip." });
  }
};

export const ViewTripDetails = async (req, res) => {
  const { tripId } = req.params;
  const tripid = Number(tripId);

  // Step 1: Validate the tripId
  if (!tripid || isNaN(tripid) || typeof tripid !== "number" || tripid <= 0) {
    return res.status(400).json({ error: "Invalid trip ID provided." });
  }

  try {
    // Step 2: Define the SQL query
    const query = "SELECT * FROM tripdetails WHERE id = ?";

    // Step 3: Execute the query using the async method (assuming queryAsync is defined)
    const result = await queryAsync(query, [tripid]);

    // Step 4: Check if the result is empty
    if (result.length === 0) {
      return res.status(404).json({ error: "Trip not found." });
    }

    // Step 5: Send the result as response
    res.status(200).json({
      success: true,
      data: result[0], // Send the first result (since the ID should be unique)
    });
  } catch (error) {
    console.error("Error fetching trip details:", error);
    // Step 6: Send an error response in case of an exception
    res
      .status(500)
      .json({ error: "An error occurred while retrieving trip details." });
  }
};
