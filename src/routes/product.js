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
  getPurchaseHistory,
} from "../models/product.js";
import { getUserAdddress } from "../models/user.js";
import { isAdmin } from "../middleware/admin.js";
import { isUser } from "../middleware/user.js";
import multer from "multer";
export const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const single = multer({ storage: multer.memoryStorage() }).single("image");

///
///----------------- Public  -----------------
///
router.get("/:id(\\d+)", async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) res.status(404);
  else res.json(product);
  res.end();
});

router.get("/all", async (req, res) => {
  const products = await getAllProducts();
  res.json(products);
  res.end();
});

router.get("/image/:id", async (req, res) => {
  const id = req.params.id;

  const product = await getImageBuffer(id);

  if (product) {
    res.setHeader("Content-Type", product.type);

    res.end(product.buffer);
  } else res.status(404).end();
});

///
/// ----------------- User routes -----------------
///

router.get("/history", isUser, async (req, res) => {
  const purchaseHistory = await getPurchaseHistory(req.user.id);
  res.json(purchaseHistory).end();
});
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
//
// ----------------- Admin routes -----------------
//

router.post("/edit", isAdmin, async (req, res) => {
  const product = await editProduct(req.body);

  res.redirect("/admin/edit.html?id=" + req.body.id);
  res.end();
});

router.post("/add", isAdmin, single, async (req, res) => {
  const data = { ...req.body, image: req.file };

  const productId = await addProduct(data);

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
