import express from 'express'
import path from 'path'


export const router = express.Router()
const htmlPath = path.join(new URL(path.dirname(import.meta.url)).pathname.replace('/', ''), '../html')

router.use("/",express.static(path.join(htmlPath, 'public')))
router.use("/components", express.static(path.join(htmlPath, 'components')))
