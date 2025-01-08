import { db } from "../../models/db.js";
const queryAsync = async (query, params) => {
  const [results] = await db.execute(query, params);
  return results;
};
const getTrips = async (req, res) => {
  try {
    const query = "SELECT * FROM tripdetails";
    const tripResults = await queryAsync(query);

    if (tripResults.length > 0) {
      return res.status(200).json({
        success: true,
        data: tripResults,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No trip details found.",
      });
    }
  } catch (error) {
    console.error("Error fetching trip details:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching trip details from the database.",
      error: error.message,
    });
  }
};

export default getTrips;
