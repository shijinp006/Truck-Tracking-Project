import express from "express";
const router = express.Router();

import AuthController from "../../controller/Admin/Authctrl.js";
const { login } = AuthController;
import FinanceAuthController from "../../controller/Admin/FinanceAuthctrl.js";
const { financelogin } = FinanceAuthController;

// router.post("/signup",signup)

router.post("/login", login);
router.post("/financelogin", financelogin);

export default router;
