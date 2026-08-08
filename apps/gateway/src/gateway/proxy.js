import { createProxyMiddleware } from "http-proxy-middleware";
import { captureRequest } from "../capture/requestCapture.js";

export const proxy = createProxyMiddleware({
  router: (req) => req.project.targetBaseUrl,
  changeOrigin: true,
  logger: console,

  on: {
    proxyReq: (proxyReq, req) => {
      req._proxyStartTime = Date.now();
    },

    proxyRes: (proxyRes, req) => {
      const latencyMs = Date.now() - (req._proxyStartTime || Date.now());

      // fire-and-forget: capture must never block or delay the actual
      // response being sent back to the client
      captureRequest({
        projectId: req.project.id,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: proxyRes.statusCode,
        latencyMs,
        ip: req.ip || req.socket?.remoteAddress,
      });
    },

    error: (err, req, res) => {
      console.error(`[gateway/proxy] Error forwarding to target:`, err.message);

      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
      }
      res.end(
        JSON.stringify({
          success: false,
          message: "Bad gateway: target service unreachable",
        })
      );
    },
  },
});