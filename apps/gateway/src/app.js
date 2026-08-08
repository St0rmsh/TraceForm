import express from "express";
import cors from "cors";
import { resolveProject } from "./middlewares/resolveProject.js";
import { proxy } from "./gateway/proxy.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";


const app = express();

app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Traceform gateway is running" });
});

// every proxied request must resolve to a project first, then gets forwarded
app.use(resolveProject, rateLimiter, proxy);



export default app;