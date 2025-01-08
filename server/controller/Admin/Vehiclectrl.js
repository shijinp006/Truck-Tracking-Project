import { db } from "../../models/db.js";
import ensureTableExists from "../../models/Vehicle.js";
ensureTableExists();
const queryAsync = async (query, params) => {
  const [results] = await db.execute(query, params);
  return results;
};
// Add vehicle function with named export
export const addVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleName } = req.body;
    console.log(vehicleNumber, "vehi");

    // Validate input fields
    if (!vehicleNumber || !vehicleName) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number and name are required.",
      });
    }

    // Validate vehicleNumber format (alphanumeric with optional hyphens)

    // Check if the vehicle already exists
    const checkQuery = "SELECT id FROM vehicledetails WHERE vehicleNumber = ?";
    const existingVehicles = await queryAsync(checkQuery, [vehicleNumber]);

    if (existingVehicles.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This vehicle already exists. Please use a unique vehicle number.",
      });
    }

    // Insert the new vehicle into the database
    const insertQuery = `
      INSERT INTO vehicledetails (vehicleNumber, vehicleName)
      VALUES (?, ?)
    `;
    const insertResult = await queryAsync(insertQuery, [
      vehicleNumber,
      vehicleName,
    ]);

    // Send success response
    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully.",
      vehicleId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error adding vehicle:", error);

    // Use NODE_ENV to toggle detailed error messages
    // const isDevelopment = process.env.NODE_ENV === "development";

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
      ...(isDevelopment && { error: error.message }), // Detailed error only in development
    });
  }
};

// Get vehicle function with named export
export const getVehicle = async (req, res) => {
  try {
    // Query to get all vehicles
    const query = "SELECT * FROM vehicledetails";
    const result = await queryAsync(query); // Use await for async queries

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No vehicles found.",
      });
    }
  } catch (error) {
    console.error("Error fetching vehicles:", error);

    const isDevelopment = process.env.NODE_ENV === "development";
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
      ...(isDevelopment && { error: error.message }), // Detailed error only in development
    });
  }
};

export const EditVehicle = async (req, res) => {
  try {
    const { id } = req.params; // Get vehicle ID from the URL params
    const { vehicleNumber, vehicleName } = req.body; // Get vehicle data from the request body

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID. It should be a positive integer.",
      });
    }

    // Validate vehicleNumber (should be a non-empty string)
    if (typeof vehicleNumber !== "string" || vehicleNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle number. It should be a non-empty string.",
      });
    }

    // Validate vehicleName (should be a non-empty string)
    if (typeof vehicleName !== "string" || vehicleName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle name. It should be a non-empty string.",
      });
    }

    console.log("name:", vehicleName, "number:", vehicleNumber, "id:", id);

    // Check if the vehicle exists in the database
    const checkQuery = "SELECT * FROM vehicledetails WHERE id = ?";
    const result = await queryAsync(checkQuery, [id]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    // Check if a vehicle with the same vehicleNumber already exists, excluding the current vehicle
    const checkExistingQuery =
      "SELECT id FROM vehicledetails WHERE vehicleNumber = ? AND id != ?";
    const existingVehicles = await queryAsync(checkExistingQuery, [
      vehicleNumber,
      id,
    ]);

    if (existingVehicles.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This vehicle already exists. Please use a unique vehicle number.",
      });
    }

    // Update the vehicle details if the vehicle exists
    const updateQuery =
      "UPDATE vehicledetails SET vehicleNumber = ?, vehicleName = ? WHERE id = ?";
    const updateResult = await queryAsync(updateQuery, [
      vehicleNumber,
      vehicleName,
      id,
    ]);

    // Check if the update was successful
    if (updateResult.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Vehicle updated successfully.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update vehicle. No changes made.",
      });
    }
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a positive integer
    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID. It should be a positive integer.",
      });
    }

    // Check if the vehicle exists before attempting to delete
    const checkQuery = "SELECT * FROM vehicledetails WHERE id = ?";
    const vehicle = await queryAsync(checkQuery, [id]);

    if (vehicle.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    // Proceed with deletion if the vehicle exists
    const deleteQuery = "DELETE FROM vehicledetails WHERE id = ?";
    const result = await queryAsync(deleteQuery, [id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to delete vehicle. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};
