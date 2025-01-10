import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import Userroute from "../server/routes/Admin/Userroute.js";
import Authroute from "../server/routes/Admin/Authroute.js";
import UserAuth from "../server/routes/User/Authroute.js";
import vehicleroute from "../server/routes/Admin/vehicleroute.js";
import triproute from "../server/routes/Admin/createtriproute.js";
import Useralltriproute from "../server/routes/User/alltrip.js";
import edittrip from "../server/routes/Admin/edittrip.js";
import Category from "../server/routes/Admin/categoryrout.js";
import Addcreditpoint from "../server/routes/Admin/creditpointroute.js";
import filterDetails from "../server/routes/Admin/filtertripdetails.js";
import UserfilterDetails from "../server/routes/User/filtertripdetails.js";
import ExcelData from "../server/routes/Admin/ExcelData.js";
import Userstatus from "../server/routes/User/status.js";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Requested-With"
//   );
//   res.header("Access-Control-Allow-Credentials", "true"); // If credentials are needed
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204); // Send 204 for preflight requests
//   }
//   next();
// });

app.use("/api", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(
//   session({
//     secret: "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }, // Set to true in production when using HTTPS
//   })
// );

// Routes
app.use("/api/Admin", Userroute);
app.use("/api/Admin", Authroute);
app.use("/api/Admin", vehicleroute);
app.use("/api/Admin", triproute);
app.use("/api/Admin", edittrip);
app.use("/api/Admin", Category);
app.use("/api/Admin", Addcreditpoint);
app.use("/api/Admin", filterDetails);
app.use("/api/User", UserfilterDetails);
app.use("/api/Admin", ExcelData);
app.use("/api/User", UserAuth);
app.use("/api/User", Useralltriproute);
app.use("/api/User", Userstatus);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
