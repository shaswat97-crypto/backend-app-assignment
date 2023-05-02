import express from "express";
import {
  signup,
  resetpassword,
  login,
  update,
} from "./controller/userController.js";

export const router = express.Router();

router
  .post("/signup", signup)
  .post("/resetpassword", resetpassword)
  .post("/login", login)
  .put("/users/:id", update);
