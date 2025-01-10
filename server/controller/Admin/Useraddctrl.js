import { db } from "../../models/db.js";
import ensureTableExists from "../../models/DriverCreation.js";
import bcrypt from "bcrypt";

ensureTableExists();

const queryAsync = async (query, params) => {
  const [results] = await db.execute(query, params);
  return results;
};

export const Adduser = async (req, res) => {
  const { phoneNumber, name, licenseDoc, password } = req.body;
  console.log(password, "password");

  try {
    // Validate required fields
    if (!phoneNumber || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and name are required fields.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate phoneNumber (must be exactly 10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. It must be exactly 10 digits.",
      });
    }

    // Validate name (should only contain alphabets and spaces)
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Invalid name. It should only contain alphabets and spaces.",
      });
    }

    // Check if a user with the same name already exists
    const checkQueryName = "SELECT id FROM userdetails WHERE name = ?";
    const existingUsers = await queryAsync(checkQueryName, [name]);

    // Check if a user with the same phone number already exists
    const checkQueryPhone = "SELECT id FROM userdetails WHERE phoneNumber = ?";
    const existingPhone = await queryAsync(checkQueryPhone, [phoneNumber]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this Name already exists.",
      });
    }

    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists.",
      });
    }

    // Insert the new user into the database
    const insertQuery = `
      INSERT INTO userdetails (phoneNumber, name, licenseDoc,password)
      VALUES (?, ?, ?, ?)
    `;
    const insertResult = await queryAsync(insertQuery, [
      phoneNumber,
      name,
      licenseDoc || null, // Use null if licenseDoc is undefined or falsy
      hashedPassword,
    ]);

    // Respond with success
    return res.status(201).json({
      success: true,
      message: "Driver created successfully.",
      userId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error during Adduser operation:", error);

    // Conditionally include error details in the response for development
    const isDevelopment = process.env.NODE_ENV === "development";
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      ...(isDevelopment && { error: error.message }), // Include error details in development mode
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { driverName } = req.query;

    // Query to fetch all users from the database
    let query = "SELECT * FROM userdetails WHERE 1=1";
    const values = [];

    if (driverName) {
      query += " AND name LIKE ?";
      values.push(`${driverName}%`); // Append '%' to driverName
    }

    // Execute the query asynchronously
    const users = await queryAsync(query, values);

    // Check if any users were found
    if (users.length > 0) {
      return res.status(200).json({
        success: true,
        data: users,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No users found.",
      });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    // Respond with a generic error message
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching users.",
    });
  }
};

export const EditUser = async (req, res) => {
  try {
    const { name, creditpointreceived, phoneNumber } = req.body;
    const { id } = req.params;

    // Validate input data
    if (!id || !name || !phoneNumber || creditpointreceived == null) {
      return res.status(400).json({
        message: "Invalid input. Please provide all required fields.",
      });
    }

    console.log("Updating user with details:", {
      name,
      phoneNumber,
      creditpointreceived,
      userId: id,
    });

    // Check if the user exists
    const checkUserQuery = "SELECT * FROM userdetails WHERE id = ?";
    const userResult = await queryAsync(checkUserQuery, [id]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user details
    const updateUserQuery = `
      UPDATE userdetails 
      SET name = ?, phoneNumber = ?, creditpointreceived = ? 
      WHERE id = ?
    `;
    await queryAsync(updateUserQuery, [
      name,
      phoneNumber,
      creditpointreceived,
      id,
    ]);

    let remainingCredit = parseFloat(creditpointreceived);
    if (remainingCredit <= 0) {
      return res.status(200).json({ message: "User updated successfully." });
    }

    // Fetch trips in descending order by trip ID
    const fetchTripsQuery = `
      SELECT id, credit, creditallowed 
      FROM tripdetails 
      WHERE driverId = ? 
      ORDER BY id DESC
    `;
    const trips = await queryAsync(fetchTripsQuery, [id]);
    console.log(trips, "tr");

    if (!trips.length) {
      return res.status(200).json({
        message: "User updated successfully. No unclaimed trips found.",
      });
    }

    // Iterate over trips and deduct credits
    for (const trip of trips) {
      if (remainingCredit <= 0) break;
      const tripId = trip.id;

      const allowedCredit = parseFloat(trip.creditallowed);
      console.log(allowedCredit, "allow");

      // Calculate the credit to claim for the current trip
      const creditToClaim = Math.min(allowedCredit, remainingCredit);

      // Insert into creditpoint_history with debitCreditPoint
      const insertHistoryQuery = `
        INSERT INTO creditpoint_history (driverId, tripId, debitCreditPoint) 
        VALUES (?, ?, ?)
      `;
      await queryAsync(insertHistoryQuery, [id, tripId, creditToClaim]);

      // Deduct the claimed credit from remaining credit
      remainingCredit -= creditToClaim;
      const updateTripCreditQuery = `
      UPDATE tripdetails 
      SET credit = ? 
      WHERE id = ?
    `;
      await queryAsync(updateTripCreditQuery, [creditToClaim, tripId]);
    }

    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error in EditUser:", error.message);
    res.status(500).json({
      message: "An error occurred while editing the user.",
      error: error.message,
    });
  }
};

// export const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const userId = Number(id);
//     console.log("UserId :", typeof userId);
//     if (typeof userId !== "number" || isNaN(userId) || userId <= 0) {
//       return res
//         .status(400)
//         .json({ error: "Invalid userId. It must be a positive number." });
//     }

//     // Check if the user exists
//     const checkQuery = "SELECT * FROM userdetails WHERE id = ?";
//     const result = await queryAsync(checkQuery, [userId]);

//     if (result.length === 0) {
//       // If no user found, return a 404 response
//       return res.status(404).json({ message: "User not found" });
//     }

//     // If user exists, delete the user
//     const deleteQuery = "DELETE FROM userdetails WHERE id = ?";
//     await queryAsync(deleteQuery, [userId]);

//     // Send success response
//     return res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error);

//     // Send error response
//     return res.status(500).json({
//       message: "An error occurred while deleting the user",
//       error: error.message,
//     });
//   }
// };
