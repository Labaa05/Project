import express from 'express'
import { router as htmlRouter } from './html.js'
import {router as userRouter }from './user.js'

// Creates a new express router
export const router = express.Router()

router.use(htmlRouter)
router.use(userRouter)
