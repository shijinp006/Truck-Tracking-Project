import { db } from "../../models/db.js";

const queryAsync = async (query, params = []) => {
  try {
    const [results] = await db.execute(query, params);
    return results;
  } catch (err) {
    console.error("Database query error:", err.message);
    throw new Error("Database operation failed.");
  }
};

const getExcelData = async (req, res) => {
  try {
    const query = "SELECT * FROM tripdetails";
    const result = await queryAsync(query);

    if (!result || result.length === 0) {
      console.log("No data found in trip details.");
      return res.status(404).json({
        success: false,
        message: "No data found in trip details.",
      });
    }

    console.log("Query Result:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching Excel data:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trip details.",
    });
  }
};

export default getExcelData;
