import { redisConnection } from "../config/redis.js";
import RequestLog from "@traceform/shared/models/RequestLog.model.js";

const FLUSH_QUEUE_KEY = "traceform:flushqueue";
const FLUSH_INTERVAL_MS = 5000;
const FLUSH_BATCH_SIZE = 500;

async function flushBatch() {
  // RPOP with a count atomically pops up to N oldest entries in one round trip
  // (list is LPUSH'd on write, so RPOP drains oldest-first = FIFO)
  const rawEntries = await redisConnection.rpop(FLUSH_QUEUE_KEY, FLUSH_BATCH_SIZE);

  if (!rawEntries || rawEntries.length === 0) return;

  const docs = [];
  for (const raw of rawEntries) {
    try {
      const entry = JSON.parse(raw);
      docs.push({
        project: entry.project,
        method: entry.method,
        path: entry.path,
        statusCode: entry.statusCode,
        latencyMs: entry.latencyMs,
        ip: entry.ip,
        timestamp: new Date(entry.timestamp),
      });
    } catch (err) {
      console.error("[gateway/flush] Skipping malformed log entry:", err.message);
    }
  }

  if (docs.length === 0) return;

  try {
    await RequestLog.insertMany(docs, { ordered: false });
    console.log(`[gateway/flush] Flushed ${docs.length} request logs to MongoDB`);
  } catch (err) {
    console.error("[gateway/flush] Error inserting batch:", err.message);
  }
}

export function startFlushWorker() {
  console.log(`[gateway/flush] Flush worker started (every ${FLUSH_INTERVAL_MS}ms)`);

  setInterval(() => {
    flushBatch().catch((err) => {
      console.error("[gateway/flush] Unexpected flush error:", err.message);
    });
  }, FLUSH_INTERVAL_MS);
}