import {
  createShortUrl,
  getUserUrls,
  deleteUrl,
} from "../controller/url.controller.js";
import express from "express";

const router = express.Router();

router.post("/shorten", createShortUrl);
router.get("/user/:userId", getUserUrls);
router.delete("/:id", deleteUrl);

export default router;
