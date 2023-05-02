import express from "express";
import mongoose, { Schema } from "mongoose";
import { router } from "./routes.js";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

mongoose
  .connect("mongodb://localhost:27017/letsindorse-backend-app")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const app = express();
app.use(express.json());
app.use("/api", router);

app.listen(process.env.PORT, () => {
  console.log("Server listening at port " + process.env.PORT);
});
