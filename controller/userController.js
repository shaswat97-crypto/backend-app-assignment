import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";
import  CryptoJS  from "crypto-js";
import pkg from 'validator'
const {isEmail, isMobilePhone} = pkg


function encrypt(data) {
  return CryptoJS.AES.encrypt(data, process.env.SECRET_KEY).toString();
}

function decrypt(data) {
  const bytes = CryptoJS.AES.decrypt(data, process.env.SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export const signup = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);
    // console.log(req.body);

    if (!fullName || !email || !mobileNumber || !password)
      res.status(404).json({ message: "Please provide all details" });

    if (!isEmail(email) || !isMobilePhone(mobileNumber)) res.status(401).json({ message: "Please provide valid email and mobile number" });

    const newUser = await User.create({
      fullName: encrypt(fullName),
      email: email,
      mobileNumber: encrypt(mobileNumber.toString()),
      password: hashedPass,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: "Error creating user" });
  }
};

export const resetpassword = async (req, res) => {
  try {
    const { email, oldPass, newPass } = req.body;

    if (!oldPass || !email || !newPass)
      res.status(404).json({ message: "Please provide all details" });

    const user = await User.findOne({ email: email });

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
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      res.status(404).json({ message: "Please provide all details" });

      // console.log(encrypt(email));
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    const isCorrectPass = await bcrypt.compare(
      password,
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
      process.env.JWT_SECRET
    );

    res.json({ message: "Successfully logged in", token });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: "Error logging in" });
  }
};

export const update = async (req, res) => {
  const { fullName, email, mobileNumber } = req.body;

  const data = {};
  if (fullName) data.fullName = encrypt(fullName);
  if (email) data.email = email;
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
};
