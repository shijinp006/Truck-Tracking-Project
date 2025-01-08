import express from "express";
import verifyuserToken from "../../middleware/userMiddleware.js";
const router = express.Router();

import {
  getUserTrip,
  getUserfilterTrip,
} from "../../controller/User/Usergettrip.js";
import updatedriver from "../../controller/User/upadatedriver.js";
import getTrips from "../../controller/User/getalltrips.js";
import myprofile from "../../controller/User/myprofile.js";
import userverifyToken from "../../middleware/userMiddleware.js";
import { getVehicle } from "../../controller/User/getvihicle.js";

router.get("/getusertrip", userverifyToken, getUserTrip);
router.put("/updatedriver/:tripId", userverifyToken, updatedriver);
router.get("/getalltrips", userverifyToken, getTrips);
router.get("/getprofile", userverifyToken, myprofile);
router.get("/getvehicle", userverifyToken, getVehicle);
router.get("/filterdusertrip", userverifyToken, getUserfilterTrip);

export default router;
