import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import userRoutes from "../routes/user.route.js";
import urlRoutes from "../routes/url.route.js";
import { redirectToUrl } from "../controller/url.controller.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/:code", redirectToUrl);
app.use("/api/user", userRoutes);
app.use("/api/url", urlRoutes);

export default app;
