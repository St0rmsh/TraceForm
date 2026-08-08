import autocannon from "autocannon";
import Redis from "ioredis";

const {
  RUN_ID,
  TARGET_URL,
  ROUTE,
  METHOD = "GET",
  API_KEY,
  CONNECTIONS = "5",
  DURATION_SECONDS = "30",
  BODY,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_USERNAME = "default",
  REDIS_PASSWORD,
  REDIS_TLS,
} = process.env;

function requireEnv(name, value) {
  if (!value) {
    console.error(`[worker] Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

requireEnv("RUN_ID", RUN_ID);
requireEnv("TARGET_URL", TARGET_URL);
requireEnv("ROUTE", ROUTE);
requireEnv("API_KEY", API_KEY);
requireEnv("REDIS_HOST", REDIS_HOST);
requireEnv("REDIS_PASSWORD", REDIS_PASSWORD);

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || "6379", 10),
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  tls: REDIS_TLS === "true" ? {} : undefined,
  maxRetriesPerRequest: null,
});

const resultsKey = `traceform:loadtest:${RUN_ID}:podresults`;

async function reportResult(summary) {
  await redis.lpush(resultsKey, JSON.stringify(summary));
  await redis.expire(resultsKey, 30 * 60);
}

async function reportFailure(message) {
  await reportResult({ failed: true, error: message });
}

async function run() {
  console.log(`[worker] Starting load run ${RUN_ID} — ${METHOD} ${TARGET_URL}${ROUTE}`);

  const instanceOpts = {
    url: `${TARGET_URL}${ROUTE}`,
    method: METHOD,
    connections: parseInt(CONNECTIONS, 10),
    duration: parseInt(DURATION_SECONDS, 10),
    headers: {
      "x-api-key": API_KEY,
      ...(BODY ? { "content-type": "application/json" } : {}),
    },
    ...(BODY ? { body: BODY } : {}),
  };

  autocannon(instanceOpts, async (err, result) => {
    if (err) {
      console.error("[worker] autocannon error:", err.message);
      await reportFailure(err.message);
      await redis.quit();
      process.exit(1);
    }

    const summary = {
      failed: false,
      totalRequests: result.requests.sent,
      successCount: result.requests.sent - (result.errors + result.non2xx),
      errorCount: result.errors + result.non2xx,
      avgLatencyMs: result.latency.average,
      p95LatencyMs: result.latency.p97_5,
      p99LatencyMs: result.latency.p99,
      maxLatencyMs: result.latency.max,
      throughputRps: result.requests.average,
    };

    console.log("[worker] Run complete:", summary);
    await reportResult(summary);
    await redis.quit();
    process.exit(0);
  });
}

run().catch(async (err) => {
  console.error("[worker] Fatal error:", err.message);
  await reportFailure(err.message);
  process.exit(1);
});