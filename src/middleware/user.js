import  express from 'express';
import { matchSessionTokenToUser } from '../models/user.js';


/**
 * Middleware to check if the user is an admin
 * @type {express.RequestHandler}
 */
export const isUser = async (req, res, next) => { 
    // Check if the request includes a cookie
    if (!req.cookies) {
        res.status(401).send('Your request didn\'t include a cookie').end(); 
        return
    }

    // Check if the cookie includes a session token
    const user = await matchSessionTokenToUser(req.cookies.session);
    
    // Check if the session token matches a user
    if (user) {
        req.user = user;
        next()
    }
    // If the session token doesn't match any user, send a 401 status
    else 
        res.status(401).send("Your session token didn't match any user").end();
    
}