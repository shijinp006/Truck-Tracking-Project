import { db } from "../../models/db.js";

const queryAsync = async (query, params) => {
  try {
    const [results] = await db.execute(query, params);
    return results;
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
};

const updatedriver = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name } = req.body;

    if (!tripId || !name) {
      return res.status(400).json({
        success: false,
        message: "Trip ID and driver name are required.",
      });
    }

    console.log("Received tripId:", tripId, "Driver name:", name);

    // Check if the trip exists
    const checkTripQuery = "SELECT id FROM tripdetails WHERE id = ?";
    const tripExists = await queryAsync(checkTripQuery, [tripId]);

    if (tripExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    // Check if the driver exists in userdetails
    const checkDriverQuery = "SELECT id FROM userdetails WHERE name = ?";
    const driverRow = await queryAsync(checkDriverQuery, [name]);

    if (driverRow.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found in userdetails table.",
      });
    }

    const driverId = driverRow[0].id;

    // Update tripdetails with the new driver
    const updateQuery =
      "UPDATE tripdetails SET name = ?, driverId = ? WHERE id = ?";
    await queryAsync(updateQuery, [name, driverId, tripId]);

    console.log("Trip updated successfully.");

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully.",
    });
  } catch (error) {
    console.error("Error updating trip:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error updating trip",
    });
  }
};

export default updatedriver;
