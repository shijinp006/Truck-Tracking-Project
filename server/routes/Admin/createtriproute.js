import express from "express";

import {
  createTrip,
  // getTrips,
  // deleteTrip,
  tripCancel,
  ViewTripDetails,
} from "../../controller/Admin/createtrip.js";
import verifyToken from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createtrip", verifyToken, createTrip);

// router.get("/gettrip/:tripId", verifyToken, getTrips);

router.get("/viewtrips/:tripId", verifyToken, ViewTripDetails);

// router.delete("/deletetrip/:id", verifyToken, deleteTrip);

router.post("/tripcancel/:id", verifyToken, tripCancel);

export default router;
