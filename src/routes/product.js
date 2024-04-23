import express from "express";
import {
  getAllProducts,
  getImageBuffer,
  addProduct,
  deleteProductById,
  addProductToCart,
  getProductById,
  editProduct,
  getCartItems,
  removeItemFromCart,
  buyCartItem,
} from "../models/product.js";
import { getUserAdddress } from "../models/user.js";
import { isAdmin } from "../middleware/admin.js";
import { isUser } from "../middleware/user.js";
import multer from "multer";
export const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const single = multer({ storage: multer.memoryStorage() }).single("image");

/// ----------------- Public  -----------------
///
///
router.get("/:id(\\d+)", async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) res.status(404);
  else res.json(product);
  res.end();
});

// Get all products
router.get("/all", async (req, res) => {
  const products = await getAllProducts();
  res.json(products);
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

/// ----------------- User routes -----------------
///
///
router.post("/cart/add", isUser, async (req, res) => {
  const result = await addProductToCart(req.user.id, req.body.productId);
  res.end();
});

router.get("/cart", isUser, async (req, res) => {
  const cart = await getCartItems(req.user.id);
  res.json(cart);
  res.end();
});

router.delete("/cart/:id", isUser, async (req, res) => {
  console.log(req.params);
  console.log(req.user);
  const result = await removeItemFromCart(req.user.id, req.params.id);
  if (!result) res.status(404);
  res.end();
});

router.post("/cart/buy/:id", isUser, async (req, res) => {
  const address = await getUserAdddress(req.user.id);
  if (!address) {
    res.status(403).end();
    return;
  }

  const result = await buyCartItem(req.user.id, req.params.id);
  if (!result) res.status(404);
  res.end();
});

// ----------------- Admin routes -----------------

// Editing product
router.post("/edit", isAdmin, async (req, res) => {
  const product = await editProduct(req.body);
  // If product was edited, redirect to edito page of the item
  res.redirect("/admin/edit.html?id=" + req.body.id);
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
  console.log("Id is ", id);
  // Delete product
  const deletedItem = await deleteProductById(id);
  // If product was deleted, redirect to admin page
  if (deletedItem) res.redirect("/admin");
  // If product was not deleted, send 404 status
  else res.status(404).send("Such item does not exist.");
  // End response
  res.end();
});
