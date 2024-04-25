import express from "express";
import {
  register,
  login,
  createSession,
  matchSessionTokenToUser,
  getUserAdddress,
  updateUserAddress,
} from "../models/user.js";
import { isUser } from "../middleware/user.js";
import cookieParser from "cookie-parser";

export const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());

router.post("/register", async (req, res) => {
  const success = await register(req.body);
  if (success) res.redirect(302, "/index.html");
  else res.statu(401).send("Unauthorized");
  res.end();
});

router.post("/login", async (req, res) => {
  const user = await login(req.body);
  if (user) {
    const session = await createSession(user.id);
    res.cookie("session", session);
    res.redirect(302, "/index.html");
  } else res.status(401).send("Unauthorized");
  res.end();
});

router.get("/logout", async (req, res) => {
  res.cookie("session", "", { expires: new Date(0) });
  res.redirect(302, "/index.html");
  res.end();
});

router.get("/address", isUser, async (req, res) => {
  const userAdress = await getUserAdddress(req.user.id);
  console.log(userAdress);
  if (!userAdress) res.status(404).end();
  else res.json(userAdress).end();
});

router.post("/address", isUser, async (req, res) => {
  console.log(
    "Setting address for user with id",
    req.user.id,
    "to",
    req.body.address
  );
  const success = await updateUserAddress(req.user.id, req.body.address);
  if (success) res.redirect("/address.html");
  else res.status(500).end();
});

router.get("/me", isUser, async (req, res) => {
  res.json(req.user);
  res.end();
});
