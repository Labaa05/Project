import express from "express";
import { matchSessionTokenToUser } from "../models/user.js";

/**
 * Middleware to check if the user is an admin
 * @type {express.RequestHandler}
 */
export const isUser = async (req, res, next) => {
  if (!req.cookies) {
    res.status(401).send("Your request didn't include a cookie").end();
    console.log("Should be a 401");
    return;
  }

  const user = await matchSessionTokenToUser(req.cookies.session);

  if (user) {
    req.user = user;
    next();
  } else res.status(401).send("You are not logged in.").end();
};
