import express from "express";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://localhost/letsindorse-backend-app")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail, "Please provide a valid email address"],
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    validate: [
      (value) => isMobilePhone(value, "en-IN"),
      "Please provide a valid Indian mobile number",
    ],
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

const JWT_SECRET = "secret";

app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);

    if (!fullName || !email || !mobileNumber || !password)
      res.status(404).json({ message: "Please provide all details" });

    const newUser = await User.create({
      fullName: encrypt(fullName),
      email: encrypt(email),
      mobileNumber: encrypt(mobileNumber),
      password: hashedPass,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: "Error creating user" });
  }
});

app.post("/resetpassword", async (req, res) => {
  try {
    const { email, oldPass, newPass } = req.body;

    if (!oldPass || !email || !newPass)
      res.status(404).json({ message: "Please provide all details" });

    const user = await User.findOne({ email: encrypt(email) });

    const isCorrectPass = await bcrypt.compare(oldPass, user.password);

    if (!isCorrectPass) {
      res.status(401).json({ message: "Incorrect old passowrd" });
    }

    const newHashedPass = await bcrypt.hash(newPass, 10);
    user.password = newHashedPass;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: "Error resetting password" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      res.status(404).json({ message: "Please provide all details" });

    const user = await User.findOne({ email: encrypt(email) });

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    const isCorrectPass = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isCorrectPass) {
      res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: email,
        mobileNumber: decrypt(user.mobileNumber),
      },
      JWT_SECRET
    );

    res.json({ message: "Successfully logged in", token });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: "Error logging in" });
  }
});

router.put("/users/:id", async (req, res) => {
  const { fullName, email, mobileNumber } = req.body;

  const data = {};
  if (fullName) data.fullName = encrypt(fullName);
  if (email) data.email = encrypt(email);
  if (mobileNumber) data.mobileNumber = mobileNumber;

  try {
    let user = await User.findById(req.params.id);

    if (!user) res.status(404).json({ message: "User not found" });

    user = await User.findByIdAndUpdate(req.params.id, { data }, { new: true });

    res.json({ message: "Details updated successfully" });
  } catch (err) {
    console.log({ err });
    res.status(500).send("Error updating details");
  }
});

app.listen(8080, () => {
  console.log("Server listening at port 8080");
});
