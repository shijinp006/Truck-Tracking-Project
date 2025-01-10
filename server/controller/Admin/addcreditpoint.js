import { db } from "../../models/db.js";
import ensureTableExists from "../../models/creditpointhistory.js";
ensureTableExists();
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

  console.log(credit, "credit");

  // Parse and validate the credit value
  const creditPoint = Number(credit);
  const creditallowed = Number(credit);
  if (!tripId || !credit) {
    return res
      .status(400)
      .json({ message: "Missing required parameters: tripId and/or credit" });
  }

  if (
    isNaN(creditPoint) ||
    creditPoint <= 0 ||
    isNaN(creditallowed) ||
    creditallowed <= 0
  ) {
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
      "UPDATE tripdetails SET  credit = ?,creditallowed = ?,status = ? WHERE id = ?";
    await queryAsync(updateTripQuery, [
      tripCredit + creditPoint,
      tripCredit + creditallowed,
      status,
      tripId,
    ]);
    const creditpointhistoryquery =
      "SELECT * FROM creditpoint_history WHERE tripId = ?";
    const creditpointhistoryqueryresults = await queryAsync(
      creditpointhistoryquery,
      [tripId]
    );

    if (creditpointhistoryqueryresults.length === 0) {
      // If no existing record, insert a new credit point history
      const insertCreditHistoryQuery =
        "INSERT INTO creditpoint_history (driverId, tripId, creditCreditpoint, debitCreditPoint) VALUES (?, ?, ?, ?)";
      await queryAsync(insertCreditHistoryQuery, [
        driverId,
        tripId,
        creditPoint, // credit point to be added
        0, // debit point, assuming 0 for this case
      ]);
    }
    const creditpointhistor = creditpointhistoryqueryresults[0];
    console.log(creditpointhistor, "history");

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
    const { id: userId } = req.params;
    const { credit } = req.body;

    if (!userId || isNaN(Number(userId)) || isNaN(Number(credit))) {
      return res.status(400).json({
        error: "Invalid input: userId and credit must be valid numbers.",
      });
    }

    const creditToAdd = Number(credit);

    // Fetch user details
    const checkQuery = "SELECT * FROM userdetails WHERE id = ?";
    const [user] = await queryAsync(checkQuery, [userId]);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const updatedCreditReceived =
      creditToAdd + Number(user.creditpointreceived);

    if (creditToAdd > user.creditpoint) {
      return res.status(400).json({
        error: "Invalid input: credit to add must not exceed collected points.",
      });
    }

    // Update credit received
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

    let remainingCredit = creditToAdd;

    // Fetch trips in ascending order by trip ID
    const fetchTripsQuery = `
      SELECT id, credit
      FROM tripdetails 
      WHERE driverId = ? 
      ORDER BY id ASC
    `;
    const trips = await queryAsync(fetchTripsQuery, [userId]);

    if (!trips.length) {
      return res.status(404).json({
        message: "No unclaimed trips found for the driver.",
      });
    }

    // Iterate over trips and deduct credits
    for (const trip of trips) {
      if (remainingCredit <= 0) break;

      const tripId = trip.id;
      const availableCredit = trip.credit;

      // Calculate the credit to claim for the current trip
      const creditToClaim = Math.min(availableCredit, remainingCredit);

      // Insert into creditpoint_history
      const insertHistoryQuery = `
        INSERT INTO creditpoint_history (driverId, tripId, debitCreditPoint) 
        VALUES (?, ?, ?)
      `;
      await queryAsync(insertHistoryQuery, [userId, tripId, creditToClaim]);

      // Update the trip's remaining credit
      const updateTripCreditQuery = `
        UPDATE tripdetails SET credit = credit - ? WHERE id = ?
      `;
      await queryAsync(updateTripCreditQuery, [creditToClaim, tripId]);

      // Deduct the claimed credit from remaining credit
      remainingCredit -= creditToClaim;
    }

    // Final response
    return res.status(200).json({
      message: "Credit points claimed successfully.",
      data: {
        userId,
        claimedCredit: creditToAdd,
        remainingCredit,
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
