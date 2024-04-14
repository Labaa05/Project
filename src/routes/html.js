import express from 'express'
import path from 'path'
import { isAdmin } from '../middleware/admin.js'
import cookieParser from 'cookie-parser'


// Create a new router
export const router = express.Router()

// Add the cookie parser middleware to the router
router.use(cookieParser());

// Get the path to the html folder
const htmlPath = path.join(new URL(path.dirname(import.meta.url)).pathname.replace('/', ''), '../html')

// Serve the public html files
router.use("/",express.static(path.join(htmlPath, 'public')))

// Serve the admin html files
router.use('/admin', isAdmin, express.static(path.join(htmlPath, 'admin')))

// Serve the components html files
router.use("/components", express.static(path.join(htmlPath, 'components')))

