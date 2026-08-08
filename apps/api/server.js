import http from "http";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import "./src/config/redis.js";
import { config } from "./src/config/config.js";
import { initSocket } from "./src/realtime/socket.js";

async function startServer() {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`[server] Traceform API running on port ${config.port} (${config.nodeEnv})`);
  });
}

startServer();