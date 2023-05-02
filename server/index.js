import express from "express";
import mongoose, { Schema } from "mongoose";
import { router } from "./routes.js";

mongoose
  .connect("mongodb://localhost:27017/letsindorse-backend-app")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const app = express();
app.use(express.json());
app.use("/api", router);

app.listen(8080, () => {
  console.log("Server listening at port 8080");
});
