import { db } from "../../models/db.js";

const queryAsync = async (query, params) => {
  try {
    const [results] = await db.execute(query, params);
    return results;
  } catch (error) {
    throw new Error(`Database Query Error: ${error.message}`);
  }
};

export const addCreditPoint = async (req, res) => {
  const { tripId } = req.params;
  const { credit } = req.body;

  console.log(credit, "cre");

  // Parse and validate the credit value
  const creditPoint = Number(credit);
  if (!tripId || !credit) {
    return res
      .status(400)
      .json({ message: "Missing required parameters: tripId and/or credit" });
  }

  if (isNaN(creditPoint) || creditPoint <= 0) {
    return res
      .status(400)
      .json({ message: "Invalid credit value. It must be a positive number." });
  }

  const status = "submitted";

  try {
    // Retrieve trip details
    const tripQuery = "SELECT * FROM tripdetails WHERE id = ?";
    const tripResults = await queryAsync(tripQuery, [tripId]);

    if (tripResults.length === 0) {
      return res
        .status(404)
        .json({ message: `Trip with ID ${tripId} not found` });
    }

    const { driverId, tripmode, credit: tripCredit } = tripResults[0];
    if (tripmode === "empty") {
      return res
        .status(400)
        .json({ message: "Cannot add credit points for an empty trip mode." });
    }

    // Retrieve driver details
    const driverQuery = "SELECT * FROM userdetails WHERE id = ?";
    const driverResults = await queryAsync(driverQuery, [driverId]);

    if (driverResults.length === 0) {
      return res
        .status(404)
        .json({ message: `Driver with ID ${driverId} not found` });
    }

    const { creditpoint: existingCredit } = driverResults[0];
    const updatedCredit = existingCredit + creditPoint;

    console.log(updatedCredit, "upt");

    // Update the trip's credit points and status
    const updateTripQuery =
      "UPDATE tripdetails SET  credit = ?, status = ? WHERE id = ?";
    await queryAsync(updateTripQuery, [
      tripCredit + creditPoint,
      status,
      tripId,
    ]);

    // Update the driver's total credit points
    const updateDriverQuery =
      "UPDATE userdetails SET creditpoint = ? WHERE id = ?";
    await queryAsync(updateDriverQuery, [updatedCredit, driverId]);

    console.log(`Credit points updated successfully for trip ID: ${tripId}`);

    return res.status(200).json({
      message: "Credit points updated successfully",

      driverId,
      updatedCredit,
    });
  } catch (error) {
    console.error("Error in addCreditPoint:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getCreditpoint = async (req, res) => {
  try {
    // Extract parameters and body
    const { id: userId } = req.params;
    const { credit } = req.body;

    console.log(`Received userId: ${userId}`);
    console.log(`Received credit point: ${credit}`);

    // Validate input
    if (!userId || isNaN(Number(userId)) || isNaN(Number(credit))) {
      return res.status(400).json({
        error: "Invalid input: userId and credit must be valid numbers.",
      });
    }

    // Convert credit to a number
    const creditToAdd = Number(credit);

    // Fetch user details from the database
    const checkQuery = "SELECT * FROM userdetails WHERE id = ?";
    const [user] = await queryAsync(checkQuery, [userId]);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    console.log(`User details fetched: ${JSON.stringify(user)}`);

    // Update the credit in the database
    const updatedCreditReceived =
      creditToAdd + Number(user.creditpointreceived);
    console.log(`Updated credit received: ${updatedCreditReceived}`);

    if (creditToAdd > user.creditpoint) {
      console.log("f");

      return res.status(400).json({
        error:
          "Invalid input: credit to add must be greater than .Collected point",
      });
    }

    // Update credit received in the database
    const updateQuery =
      "UPDATE userdetails SET creditpointreceived = ? WHERE id = ?";
    const result = await queryAsync(updateQuery, [
      updatedCreditReceived,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        error: "No changes detected. Credit update failed.",
      });
    }

    console.log(`Credit successfully updated for userId: ${userId}`);

    // Send success response
    res.status(200).json({
      message: "Credit points updated successfully.",
      data: {
        userId,
        updatedCreditReceived,
      },
    });
  } catch (error) {
    console.error("Error updating credit points:", error);

    res.status(500).json({
      error:
        "An error occurred while updating credit points. Please try again.",
    });
  }
};
