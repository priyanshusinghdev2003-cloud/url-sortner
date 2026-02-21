import express from "express";
import {
  registerUser,
  loginUser,
  AuthUser,
} from "../controller/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", AuthUser);

export default router;
