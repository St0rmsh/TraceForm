import { createProxyMiddleware } from "http-proxy-middleware";

// router dynamically picks the target per-request based on req.project,
// which resolveProject middleware attaches before this runs. This is what
// lets one gateway serve many registered projects instead of proxying to
// a single fixed target.
export const proxy = createProxyMiddleware({
  router: (req) => req.project.targetBaseUrl,
  changeOrigin: true,
  logger: console,

  on: {
    proxyReq: (proxyReq, req) => {
      // stamp the start time on the raw request so downstream capture
      // logic (next feature) can compute latency on the response
      req._proxyStartTime = Date.now();
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