import { db } from "../../models/db.js";

const queryAsync = async (query, params) => {
  const [results] = await db.execute(query, params);
  return results;
};

// Get all vehicles from the database
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
