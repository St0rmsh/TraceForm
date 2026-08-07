import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import "./src/config/redis.js"; 
import { config } from "./src/config/config.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.8"])

async function startServer() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`[server] Traceform API running on port ${config.port} (${config.nodeEnv})`);
  });
}

startServer();