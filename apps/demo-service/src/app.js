import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products.routes.js";
import usersRoutes from "./routes/users.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import chaosRoutes from "./routes/chaos.routes.js";
import { chaosInjector } from "./middlewares/chaosInjector.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Demo service is running" });
});

// chaos control routes bypass chaosInjector — you must always be able to turn chaos off
app.use("/chaos", chaosRoutes);

// business routes — chaos-affected
app.use("/api/products", chaosInjector, productsRoutes);
app.use("/api/users", chaosInjector, usersRoutes);
app.use("/api/checkout", chaosInjector, checkoutRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

export default app;