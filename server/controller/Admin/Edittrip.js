import { db } from "../../models/db.js";
import ensureTableExists from "../../models/createtrip.js";
ensureTableExists();

const editTrip = async (req, res) => {
  const queryAsync = async (query, params) => {
    try {
      const [results] = await db.execute(query, params);
      return results;
    } catch (err) {
      console.error("Database query error:", err);
      throw new Error("Database operation failed.");
    }
  };

  const { tripId } = req.params;
  const {
    tripfrom,
    tripto,
    meterbefore,
    meterafter,
    fuel,
    vehiclenumber,
    tripmode,
    category,
    credit,

    status,
    name,
  } = req.body;
  console.log("hellp");
  console.log(tripId, "id");

  const creditPoint = Number(credit);
  const invoicedoc = req.file ? req.file.filename : null; // Optional file upload

  const tripid = Number(tripId);

  // Validate required fields
  if (!tripid || !name) {
    return res.status(400).json({
      success: false,
      message: !tripId ? "Trip ID is required." : "Driver name is required.",
    });
  }

  try {
    // Check if the trip exists
    const checkTripQuery = "SELECT * FROM tripdetails WHERE id = ?";
    const tripExists = await queryAsync(checkTripQuery, [tripid]);

    if (tripExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Trip with ID ${tripId} not found.`,
      });
    }

    const existTripcredit = tripExists[0].credit;
    const tripMode = tripExists[0].tripmode;

    // Check if the driver exists
    const checkDriverQuery = "SELECT * FROM userdetails WHERE name = ?";
    const driverRow = await queryAsync(checkDriverQuery, [name]);
    if (driverRow.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Driver ${name} not found in userdetails.`,
      });
    }
    const driverId = driverRow[0].id;

    const driverCredit = driverRow[0].creditpoint;

    const updatedCredit = driverCredit - existTripcredit;
    const uploadCredit = updatedCredit + creditPoint;

    const updatedCreditquery = `UPDATE userdetails SET creditpoint = ? WHERE id = ?`;

    await queryAsync(updatedCreditquery, [uploadCredit, driverId]);

    // Dynamically construct the update query
    let updateQuery = `UPDATE tripdetails SET tripfrom = ?, tripto = ?, meterbefore = ?, meterafter = ?, fuel = ?, vehiclenumber = ?, tripmode = ?, category = ?,  status = ?, name = ?, driverId = ?`;

    const values = [
      tripfrom,
      tripto,
      meterbefore,
      meterafter,
      fuel,
      vehiclenumber,
      tripmode,
      category,

      status,
      name,
      driverId,
    ];

    // Add invoicedoc if it's not null
    if (invoicedoc) {
      updateQuery += ", invoicedoc = ?";
      values.push(invoicedoc);
    }

    // Optionally include the credit update if tripMode is not 'empty'
    if (tripMode !== "empty" && creditPoint !== undefined) {
      updateQuery += ", credit = ?";
      values.push(creditPoint);
    }

    // Add WHERE condition to specify the tripId
    updateQuery += " WHERE id = ?";
    values.push(tripid);

    // Perform the update query
    const result = await queryAsync(updateQuery, values);
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes detected or trip not found.",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Trip updated successfully.",
      invoicedoc: invoicedoc, // Send back the updated image filename
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while updating the trip. Please try again later.",
      error: error.message,
    });
  }
};

export default editTrip;
