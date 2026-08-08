import { config } from "../config/config.js";

const MAX_PARALLEL_PODS = 10;

const GATEWAY_HOST_URL = process.env.GATEWAY_HOST_URL || "http://host.docker.internal:4001";

export function buildLoadTestJob(run, project) {
  const podCount = Math.min(run.config.concurrency, MAX_PARALLEL_PODS);
  const jobName = `traceform-loadtest-${run._id.toString()}`;

  const envVars = [
    { name: "RUN_ID", value: run._id.toString() },
    { name: "TARGET_URL", value: GATEWAY_HOST_URL },
    { name: "ROUTE", value: run.config.route },
    { name: "METHOD", value: run.config.method },
    { name: "API_KEY", value: project.apiKey },
    { name: "CONNECTIONS", value: String(run.config.concurrency) },
    { name: "DURATION_SECONDS", value: String(run.config.durationSeconds) },
    { name: "REDIS_HOST", value: config.redis.host },
    { name: "REDIS_PORT", value: String(config.redis.port) },
    { name: "REDIS_USERNAME", value: config.redis.username },
    { name: "REDIS_PASSWORD", value: config.redis.password },
    { name: "REDIS_TLS", value: config.redis.tls ? "true" : "false" },
  ];

  if (run.config.body) {
    envVars.push({ name: "BODY", value: JSON.stringify(run.config.body) });
  }

  return {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
      name: jobName,
      labels: {
        app: "traceform-load-worker",
        runId: run._id.toString(),
      },
    },
    spec: {
      parallelism: podCount,
      completions: podCount,
      backoffLimit: 1,
      ttlSecondsAfterFinished: 300,
      template: {
        metadata: {
          labels: {
            app: "traceform-load-worker",
            runId: run._id.toString(),
          },
        },
        spec: {
          restartPolicy: "Never",
          containers: [
            {
              name: "load-worker",
              image: "traceform/load-worker:latest",
              imagePullPolicy: "Never",
              env: envVars,
              resources: {
                requests: { cpu: "50m", memory: "64Mi" },
                limits: { cpu: "250m", memory: "128Mi" },
              },
            },
          ],
        },
      },
    },
  };
}

export function getJobName(runId) {
  return `traceform-loadtest-${runId}`;
}