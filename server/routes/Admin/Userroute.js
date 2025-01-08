import express from "express"; // Import express

const router = express.Router();

import {
  Adduser,
  getUser,
  EditUser,
  deleteUser,
} from "../../controller/Admin/Useraddctrl.js"; // Import Adduser function
import verifyToken from "../../middleware/authMiddleware.js";

router.post("/adduser", verifyToken, Adduser);

router.get("/getuser", verifyToken, getUser);

router.put("/edituser/:id", verifyToken, EditUser);

router.delete("/deleteuser/:id", verifyToken, deleteUser);

export default router; // Use export default for ES6 modules
