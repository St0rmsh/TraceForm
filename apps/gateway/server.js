import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import "./src/config/redis.js";
import { config } from "./src/config/config.js";
import { startFlushWorker } from "./src/capture/flushWorker.js";

async function startServer() {
  await connectDB();
  startFlushWorker();

  app.listen(config.port, () => {
    console.log(`[gateway] Traceform gateway running on port ${config.port} (${config.nodeEnv})`);
  });
}

startServer();