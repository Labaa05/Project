import express from "express";
import {
  getAllProducts,
  getImageBuffer,
  addProduct,
    deleteProductById,
  addProductToCart
} from "../models/product.js";
import { isAdmin } from "../middleware/admin.js";
import { isUser }  from "../middleware/user.js"; 
import multer from "multer";
export const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const single = multer({ storage: multer.memoryStorage() }).single("image");

// Get all products
router.get("/all", async (req, res) => {
  const products = await getAllProducts();
  res.json(products);
  res.end();
});

router.post("/add", isAdmin, single, async (req, res) => {
  // Combine body and file data
  const data = { ...req.body, image: req.file };
  // Add product
  const productId = await addProduct(data);
  // Send response
  res.redirect("/admin");
  res.end();
});

router.post("/delete", async (req, res) => {
    // Get product id
  const id = req.body.id;
  console.log("Id is ", id)
  // Delete product
  const deletedItem = await deleteProductById(id);
  // If product was deleted, redirect to admin page
  if (deletedItem) res.redirect("/admin");
  // If product was not deleted, send 404 status
  else res.status(404).send("Such item does not exist.");
  // End response
  res.end();
});

// Get image by product id
router.get("/image/:id", async (req, res) => {
    // Get product id
  const id = req.params.id;
  // Get product image
  const product = await getImageBuffer(id);
  // If product exists, send image
  if (product) {
    // Set headers and send image
    res.setHeader("Content-Type", product.type);
    // Send image buffer
    res.end(product.buffer);
    
  } 
  // If product does not exist, send 404 status
  else res.status(404).end();
});


router.post("/cart/add", isUser, async (req, res) => {

    const result = await addProductToCart(req.user.id, req.body.productId, req.body.quantity);
    // res.redirect("/products.html")
    res.end()
 })