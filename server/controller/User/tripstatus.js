import { db } from "../../models/db.js";

export const tripAssigned = async (req, res) => {
  const { tripId } = req.params;
  console.log("Trip ID:", tripId);

  const { meterbefore, vehiclenumber } = req.body;
  console.log(typeof vehiclenumber, typeof meterbefore);

  const meterBefore = Number(meterbefore);
  // Validate meterbefore
  if (
    isNaN(meterBefore) ||
    typeof meterBefore !== "number" ||
    meterbefore <= 0
  ) {
    return res
      .status(400)
      .json({ error: "Invalid meterbefore. It must be a positive number." });
  }

  // Validate vehiclenumber
  if (typeof vehiclenumber !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid vehiclenumber. It must be a non-empty string." });
  }
  console.log("Meter before:", meterBefore);
  console.log("Vehicle number:", vehiclenumber);

  console.log("Request body:", req.body); // Debug body
  console.log("Request files:", req.file); // Debug files

  // Check if files are present
  const meterbeforefile = req.file ? req.file.filename : null;
  if (!meterbeforefile) {
    console.error("meterbeforefile is missing");
    return res.status(400).json({ error: "meterbeforefile is missing" });
  }

  console.log("Meter before file:", meterbeforefile);

  const queryAsync = async (query, params) => {
    const [results] = await db.execute(query, params);
    return results;
  };

  try {
    // Check if the trip exists
    const checkQuery = "SELECT id FROM tripdetails WHERE id = ?";
    const tripExists = await queryAsync(checkQuery, [tripId]);

    console.log("Trip exists:", tripExists);

    if (tripExists.length > 0) {
      // Update the status to 'Trip in progress'
      const status = "inprogress";
      const updateQuery =
        "UPDATE tripdetails SET meterbefore = ?, meterbeforefile = ?, vehiclenumber = ?, status = ? WHERE id = ?";
      await queryAsync(updateQuery, [
        meterBefore,
        meterbeforefile,
        vehiclenumber,
        status,
        tripId,
      ]);

      return res
        .status(200)
        .json({ message: "Trip status updated to 'Assigned'.", success: true });
    } else {
      console.error("Trip not found");
      return res.status(404).json({ message: "Trip not found." });
    }
  } catch (error) {
    console.error("Error assigning trip:", error.message);
    return res
      .status(500)
      .json({ message: "An error occurred while assigning the trip." });
  }
};

export const tripCancel = async (req, res) => {
  const queryAsync = async (query, params) => {
    const [results] = await db.execute(query, params);
    return results;
  };

  const tripId = req.params.id;

  const tripid = Number(tripId);

  console.log(typeof tripid);

  if (isNaN(tripid) || typeof tripid !== "number" || tripid <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid tripId. It must be a positive number." });
  }

  try {
    // Check if the trip exists
    const checkQuery = "SELECT id FROM tripdetails WHERE id = ?";
    const tripExists = await queryAsync(checkQuery, [tripid]);

    if (tripExists.length > 0) {
      // Update the status to 'Cancelled'
      const status = "created";
      const meterbefore = 0;
      const meterbeforefile = null;
      const updateQuery =
        "UPDATE tripdetails SET status = ?, meterbefore = ?, meterbeforefile = ? WHERE id = ?";
      await queryAsync(updateQuery, [
        status,
        meterbefore,
        meterbeforefile,
        tripId,
      ]);

      return res.status(200).json({
        message: "Trip status updated to 'Cancelled'.",
        success: true,
      });
    } else {
      // Trip does not exist
      return res.status(404).json({ message: "Trip not found." });
    }
  } catch (error) {
    console.error("Error cancelling trip:", error.message);
    return res
      .status(500)
      .json({ message: "An error occurred while cancelling the trip." });
  }
};

export const tripComplete = async (req, res) => {
  try {
    // Utility function to execute SQL queries
    const queryAsync = async (query, params) => {
      const [results] = await db.execute(query, params);
      return results;
    };

    // Extract parameters from request
    const { tripId } = req.params;
    const { meterafter, mileage, fuel } = req.body;
    const invoicedoc = req.files["invoicedoc"]
      ? req.files["invoicedoc"][0].filename
      : null;
    const invoicedoc2 = req.files["invoicedoc2"]
      ? req.files["invoicedoc2"][0].filename
      : null;
    const invoicedoc3 = req.files["invoicedoc3"]
      ? req.files["invoicedoc3"][0].filename
      : null;
    const meterafterfile = req.files["meterafterfile"]
      ? req.files["meterafterfile"][0].filename
      : null;

    console.log(`Trip ID: ${tripId}`);
    console.log(
      ` Meter After: ${meterafter}, Fuel: ${fuel},Mileage:${mileage}`
    );
    console.log(`Uploaded Invoice Document: ${invoicedoc}`);
    console.log(`Uploaded Invoice Document2: ${invoicedoc2}`);
    console.log(`Uploaded Invoice Document3: ${invoicedoc3}`);
    console.log(`Uploaded MeterAfter file: ${meterafterfile}`);

    // Check if the trip exists in the database
    const checkTripQuery = "SELECT * FROM tripdetails WHERE id = ?";
    const tripExists = await queryAsync(checkTripQuery, [tripId]);

    if (tripExists.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });
    }

    // Update trip details
    const updateQuery = `
        UPDATE tripdetails
        SET 
         
          meterafter = ?, 
          mileage = ?,
          fuel = ?,
          invoicedoc = ?,
          invoicedoc2 = ?,
          invoicedoc3 = ?,
          meterafterfile = ?,
          status = ?
        WHERE id = ?
      `;

    const status = "completed";
    const values = [
      meterafter,
      mileage,
      fuel,
      invoicedoc,
      invoicedoc2,
      invoicedoc3,
      meterafterfile,
      status,
      tripId,
    ];

    const result = await queryAsync(updateQuery, values);

    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to update trip details." });
    }

    return res.status(200).json({
      success: true,
      message: "Trip details updated successfully.",
    });
  } catch (error) {
    console.error("Error in tripComplete function:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while completing the trip.",
      error: error.message,
    });
  }
};
