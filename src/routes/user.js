import express from "express";
import {
  register,
  login,
  createSession,
  matchSessionTokenToUser,
} from "../models/user.js";
import cookieParser from "cookie-parser";

export const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());

router.post("/register", async (req, res) => {
  const success = await register(req.body);
  // Redirect to login page if registration is successful
  if (success) res.redirect(302, "/index.html");
  // Send 401 Unauthorized if registration fails
  else res.statu(401).send("Unauthorized");
  // End the response
  res.end();
});

router.post("/login", async (req, res) => {
  // Call the login function with the request body - where the login form's data is stored
  const user = await login(req.body);
  // If the login function returns a user object, create a session and set the session cookie
  if (user) {
    // Create a session
    const session = await createSession(user.id);
    // Set the session cookie
    res.cookie("session", session);
    // Redirect to the index page
    res.redirect(302, "/index.html");
    // End the response
  }
    // If the login function returns null, send 401 Unauthorized
  else res.status(401).send("Unauthorized");
  // End the response
  res.end();
});

router.get("/me", async (req, res) => {
    // If the request does not have a session cookie, send 401 Unauthorized
  if (!req.cookies) {
    res.status(401).send("You do not have the session cookie");
    res.end();
    return;
  }
  // Call the matchSessionTokenToUser function with the session cookie
  const user = await matchSessionTokenToUser(req.cookies.session);
  res.json(user)
  res.end();
});
