import express from "express";

const router = express.Router();

import {
  addVehicle,
  getVehicle,
  EditVehicle,
  deleteVehicle,
} from "../../controller/Admin/Vehiclectrl.js";
import verifyToken from "../../middleware/authMiddleware.js";

router.post("/addvehicle", verifyToken, addVehicle);
router.get("/getVehicle", verifyToken, getVehicle);
router.put("/editVehicle/:id", verifyToken, EditVehicle);
router.delete("/deleteVehicle/:id", verifyToken, deleteVehicle);

export default router;
