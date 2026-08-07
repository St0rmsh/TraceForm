import { Router } from "express";
import { findProductById } from "../data/products.js";

const router = Router();

router.post("/", async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Checkout requires a non-empty items array",
    });
  }

  // simulate variable "processing" work proportional to cart size —
  // real checkout flows aren't flat-latency, so this makes load-test
  // results more realistic (bigger carts = slower response)
  const processingDelay = 30 + items.length * 15 + Math.random() * 40;
  await new Promise((resolve) => setTimeout(resolve, processingDelay));

  let total = 0;
  const lineItems = [];

  for (const { productId, quantity } of items) {
    const product = findProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product ${productId} not found`,
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid quantity for product ${productId}`,
      });
    }

    if (product.stock < quantity) {
      return res.status(409).json({
        success: false,
        message: `Insufficient stock for ${product.name}`,
      });
    }

    const lineTotal = product.price * quantity;
    total += lineTotal;
    lineItems.push({ productId: product.id, name: product.name, quantity, lineTotal });
  }

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: {
      orderId: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      items: lineItems,
      total: Math.round(total * 100) / 100,
    },
  });
});

export default router;