import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/config.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import morgan from "morgan";

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Traceform API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;