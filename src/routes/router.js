import express from "express";
import { router as htmlRouter } from "./html.js";
import { router as userRouter } from "./user.js";
import { router as productRouter } from "./product.js";

// Creates a new express router
export const router = express.Router();

// Mount all routers on specified paths

// HTML router
router.use("/", htmlRouter);

// API routers
router.use("/api/user", userRouter);
router.use("/api/product", productRouter);
