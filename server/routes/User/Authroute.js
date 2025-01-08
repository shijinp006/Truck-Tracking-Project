import express from 'express'; // Import express
const router = express.Router();
import checkUser from '../../controller/User/Authctrl.js';

router.post("/userlogin",checkUser);

export default router;