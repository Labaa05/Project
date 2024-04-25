import express from "express";
import { matchSessionTokenToUser } from "../models/user.js";

/**
 * Middleware to check if the user is an admin
 * @type {express.RequestHandler}
 */
export const isAdmin = async (req, res, next) => {
  if (!req.cookies) {
    res.status(401).send("Your request didn't include a cookie").end();
    return;
  }

  const user = await matchSessionTokenToUser(req.cookies.session);

  if (user) {
    if (user.isadmin === 1) next();
    else {
      res.status(401).send("You are not an admin").end();
      return;
    }
  } else {
    res.status(401).send("You are not logged in.").end();
    return;
  }
};
