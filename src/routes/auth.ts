import { Router } from "express";
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import dotenv from "dotenv";
import { registerUser } from "../services/registrationService.js";

const routes = Router();

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

routes.post('/register', async (req, res) => {
  const { email, password, username, profile, isEmailVerified } = req.body;
  const { firstName, lastName, bio } = profile || {};

  const users = await registerUser(req.body);
  
  if (!email || !password || !username) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  if (!users) return null;

  const userDto = {
    email: email,
    username: username,
    isEmailVerified: isEmailVerified,
    profile: profile,
  }

  res.status(201).send(userDto)
})

routes.get('/verify-email', async( req, res) => {
  const token = req.query.token as string;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Token is required" });
  }

  const user = await User.findOne({
    emailVerificationToken: token
  })

  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  res.send("Email verified successfully");
})

routes.post('/resend-verification', async ( req, res) => {
  const { email } = req.body;

  const userEmail = await User.findOne({
    email: email
  })
  if (!userEmail) {
  return res.status(404).json({ message: "User not found" });
}

  const payload = { userId: userEmail._id };
  
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET!, { expiresIn: "30m" });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });

  userEmail.refreshToken = refreshToken;

  res.json({
    message: "Verification tokens generated",
    accessToken,
    refreshToken
  });
})

export default routes;