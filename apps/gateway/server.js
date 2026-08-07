import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import "./src/config/redis.js";
import { config } from "./src/config/config.js";

async function startServer() {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`[gateway] Traceform gateway running on port ${config.port} (${config.nodeEnv})`);
  });
}

startServer();