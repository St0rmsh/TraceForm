import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { redisConnection } from "../config/redis.js";
import { getProjectById } from "../services/project.service.js";

const POLL_INTERVAL_MS = 1000;
const POLL_FETCH_COUNT = 50;

const projectPollers = new Map();

function hotLogKey(projectId) {
  return `traceform:hotlogs:${projectId}`;
}

function startPolling(io, projectId) {
  if (projectPollers.has(projectId)) {
    projectPollers.get(projectId).subscriberCount += 1;
    return;
  }

  const state = { lastSeenTimestamp: null, subscriberCount: 1 };

  state.intervalHandle = setInterval(async () => {
    try {
      const raw = await redisConnection.lrange(hotLogKey(projectId), 0, POLL_FETCH_COUNT - 1);
      if (!raw || raw.length === 0) return;

      const entries = raw.map((r) => JSON.parse(r));

      if (state.lastSeenTimestamp === null) {
        state.lastSeenTimestamp = entries[0].timestamp;
        return;
      }

      const newEntries = [];
      for (const entry of entries) {
        if (entry.timestamp <= state.lastSeenTimestamp) break;
        newEntries.push(entry);
      }

      if (newEntries.length > 0) {
        state.lastSeenTimestamp = entries[0].timestamp;
        for (const entry of newEntries.reverse()) {
          io.to(`project:${projectId}`).emit("request", entry);
        }
      }
    } catch (err) {
      console.error(`[socket/poll] Error polling project ${projectId}:`, err.message);
    }
  }, POLL_INTERVAL_MS);

  projectPollers.set(projectId, state);
}

function stopPolling(projectId) {
  const state = projectPollers.get(projectId);
  if (!state) return;

  state.subscriberCount -= 1;
  if (state.subscriberCount <= 0) {
    clearInterval(state.intervalHandle);
    projectPollers.delete(projectId);
  }
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = jwt.verify(token, config.jwt.accessSecret);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.subscribedProjects = new Set();

    socket.on("subscribe:project", async (projectId) => {
      try {
        await getProjectById(projectId, socket.userId);

        socket.join(`project:${projectId}`);
        socket.subscribedProjects.add(projectId);
        startPolling(io, projectId);

        socket.emit("subscribed", { projectId });
      } catch (err) {
        socket.emit("subscribe:error", {
          projectId,
          message: err.message || "Unable to subscribe to this project",
        });
      }
    });

    socket.on("unsubscribe:project", (projectId) => {
      socket.leave(`project:${projectId}`);
      if (socket.subscribedProjects.has(projectId)) {
        socket.subscribedProjects.delete(projectId);
        stopPolling(projectId);
      }
    });

    socket.on("disconnect", () => {
      for (const projectId of socket.subscribedProjects) {
        stopPolling(projectId);
      }
    });
  });

  return io;
}