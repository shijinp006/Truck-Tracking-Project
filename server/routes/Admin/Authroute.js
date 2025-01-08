import express from "express";
const router = express.Router();

import AuthController from "../../controller/Admin/Authctrl.js";
const { login } = AuthController;

// router.post("/signup",signup)

router.post("/login", login);

export default router;
