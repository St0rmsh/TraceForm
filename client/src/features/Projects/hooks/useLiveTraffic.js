import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { getAccessToken } from "../../../api/client";

// Vite's dev proxy only covers /api — Socket.io needs its own connection
// straight to the API server. In production this should come from an env
// var (e.g. import.meta.env.VITE_API_URL) rather than being hardcoded.
const SOCKET_URL = "http://localhost:3000";

const MAX_FEED_LENGTH = 200; // cap in-memory list so a busy feed doesn't grow forever

export function useLiveTraffic(projectId) {
  const [requests, setRequests] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const socketRef = useRef(null);
  const isPausedRef = useRef(false); // avoids stale closure inside the socket listener

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!projectId) return;

    const socket = io(SOCKET_URL, {
      auth: { token: getAccessToken() },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("subscribe:project", projectId);
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("request", (entry) => {
      if (isPausedRef.current) return;

      setRequests((prev) => [entry, ...prev].slice(0, MAX_FEED_LENGTH));
    });

    return () => {
      socket.emit("unsubscribe:project", projectId);
      socket.disconnect();
    };
  }, [projectId]);

  const togglePause = useCallback(() => setIsPaused((prev) => !prev), []);
  const clear = useCallback(() => setRequests([]), []);

  return { requests, isConnected, isPaused, togglePause, clear };
}