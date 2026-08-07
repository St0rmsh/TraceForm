import { Router } from "express";
import { products, findProductById, findProductsByCategory } from "../data/products.js";

const router = Router();

router.get("/", (req, res) => {
  const { category } = req.query;
  const result = category ? findProductsByCategory(category) : products;

  res.status(200).json({ success: true, data: { products: result } });
});

router.get("/:id", (req, res) => {
  const product = findProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.status(200).json({ success: true, data: { product } });
});

export default router;