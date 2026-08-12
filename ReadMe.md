# Traceform

### AI-Native Traffic, Reliability & Incident Engineering Platform

> Traceform is an end-to-end reliability engineering platform that combines a reverse-proxy gateway, Kubernetes-powered load and chaos testing, real-time traffic observability, automated anomaly detection, and an AI incident copilot.

It is designed to answer three questions:

**What is happening? → Why is it happening? → What should I do next?**

---

## ✨ Overview

Traceform sits between your application and its clients as a programmable reverse proxy.

It captures traffic and turns that data into a reliability workflow:

```text
                    ┌─────────────────────┐
                    │       Client        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Traceform Gateway  │
                    │    Data Plane       │
                    └──────────┬──────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌─────────────────┐       ┌─────────────────┐
        │  Target Service │       │ Redis / MongoDB │
        └─────────────────┘       └────────┬────────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                         ▼                 ▼                 ▼
                  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
                  │ Load Tests  │   │ Anomaly     │   │ Incident    │
                  │ + Chaos     │   │ Detection   │   │ Copilot     │
                  └──────┬──────┘   └─────────────┘   └──────┬──────┘
                         │                                   │
                         ▼                                   ▼
                    Kubernetes                         LangGraph AI
```

The three major pillars share the same data spine:

1. **Traffic Gateway** — captures real application traffic.
2. **Load & Chaos Testing** — generates controlled synthetic traffic through the same gateway.
3. **AI Incident Copilot** — analyzes the resulting telemetry and generates root-cause analysis, summaries, and runbooks.

---

# 🚀 Key Features

### 🔐 Authentication & Projects

* User authentication
* Project creation and management
* Per-project API keys
* Protected project resources

### 🌐 Reverse Proxy Gateway

* Programmable reverse proxy
* `x-api-key` based project resolution
* Request/response capture
* Latency tracking
* Status-code tracking
* Per-route health monitoring
* Redis-backed rate limiting

### 📊 Traffic Observability

* Live traffic feed
* Request metrics
* Health status
* Redis hot-log storage
* MongoDB historical persistence
* Background anomaly detection

### 🧪 Load & Chaos Testing

* Configurable RPS
* Configurable concurrency
* Configurable duration
* Kubernetes Job orchestration
* Multiple worker pods
* Live test progress
* Error injection
* Run comparison
* Latency analysis

### ☸️ Kubernetes Orchestration

Traceform dynamically creates Kubernetes Jobs through the Kubernetes API rather than relying on static manifests.

Each load-test worker runs inside its own Kubernetes pod.

```text
Load Test Request
       │
       ▼
Control Plane
       │
       ▼
Kubernetes API
       │
       ├── Worker Pod
       ├── Worker Pod
       └── Worker Pod
              │
              ▼
        Target Service
```

### 🤖 AI Incident Copilot

Traceform uses multiple AI patterns instead of treating every AI feature as a single prompt.

#### Root Cause Analysis

```text
Incident
   │
   ▼
Gather Context
   │
   ▼
Analyze
   │
   ▼
Synthesize
   │
   ▼
Structured Root Cause
```

The LangGraph pipeline produces:

* Root cause
* Confidence
* Contributing factors
* Supporting context

#### AI Incident Summary

The root-cause analysis is then provided as context to a second AI workflow that generates:

* Incident summary
* Explanation
* Recommended actions
* Runbook-style guidance

---

# 🏗️ Architecture

Traceform is organized as an npm-workspaces monorepo containing four applications:

| Application         | Responsibility                                                |
| ------------------- | ------------------------------------------------------------- |
| `apps/api`          | Control plane, authentication, projects, orchestration and AI |
| `apps/gateway`      | High-performance reverse proxy / data plane                   |
| `apps/demo-service` | Synthetic target service with chaos injection                 |
| `apps/load-worker`  | Kubernetes load-test worker                                   |

### Data Flow

```text
Client
  │
  ▼
Gateway
  │
  ├──────────────► Target Service
  │
  └──────────────► Redis
                     │
                     ▼
                  MongoDB
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   Anomaly Scanner        Incident System
                                │
                                ▼
                         LangGraph Agents
                                │
                                ▼
                    Root Cause + Runbook
```

### Gateway ↔ Control Plane

The gateway and control-plane API are intentionally decoupled.

They do **not** directly call one another.

Instead, they communicate through shared Redis and MongoDB state.

This keeps slow operations such as:

* Kubernetes API calls
* AI requests
* incident processing

away from the high-throughput request path.

---

# 🧰 Tech Stack

| Technology                  | Purpose                                  |
| --------------------------- | ---------------------------------------- |
| **Node.js + Express**       | Backend services                         |
| **React**                   | Frontend                                 |
| **Redux Toolkit**           | Frontend state management                |
| **Tailwind CSS**            | UI                                       |
| **MongoDB**                 | Persistent data                          |
| **Redis**                   | Caching, hot metrics and temporary state |
| **Kubernetes**              | Load-test orchestration                  |
| **@kubernetes/client-node** | Kubernetes API integration               |
| **autocannon**              | Load generation                          |
| **LangChain**               | AI integration                           |
| **LangGraph**               | Multi-node AI workflows                  |
| **Mistral**                 | AI analysis/summarization                |
| **Cohere**                  | Root-cause analysis                      |
| **Claude**                  | AI experimentation                       |
| **Socket.io**               | Real-time communication                  |
| **http-proxy-middleware**   | Reverse proxy                            |
| **npm Workspaces**          | Monorepo management                      |

---

# 🧠 AI Architecture

Traceform deliberately uses different AI patterns for different problems.

### 1. Single-Call Analysis

Used for:

* Load-test bottleneck analysis
* Incident summaries

```text
Telemetry
   │
   ▼
LLM
   │
   ▼
Structured Result
```

### 2. Multi-Node LangGraph

Used for root-cause analysis:

```text
┌──────────────────┐
│  Gather Context  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     Analyze      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Synthesize    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Root Cause     │
│   Confidence     │
│   Factors        │
└──────────────────┘
```

### 3. Layered AI Reasoning

The incident summary consumes the output of the root-cause analysis rather than independently analyzing the same incident again.

This creates a pipeline:

```text
Telemetry
   ↓
Root Cause Analysis
   ↓
Incident Context
   ↓
AI Summary
   ↓
Runbook
```

---

# 🧪 Load Testing

A load test can be configured with parameters such as:

```json
{
  "name": "Chaos load test",
  "config": {
    "route": "/api/products",
    "endRps": 10,
    "durationSeconds": 15,
    "concurrency": 2
  },
  "chaos": {
    "errorRatePercent": 40
  }
}
```

A concurrency of `2` results in two real Kubernetes worker pods.

The workers generate traffic against the same gateway path used by normal clients.

This means synthetic traffic and real traffic enter the same observability pipeline.

---

# 🔥 Chaos Engineering

The bundled demo service exposes a chaos-injection interface that allows controlled failures to be introduced during load tests.

Examples include:

* Increased error rates
* Controlled failure conditions
* Stress scenarios

The resulting traffic is then captured by Traceform and becomes input for the anomaly detection and incident workflows.

> **Note:** Chaos injection currently requires the target service to implement Traceform's `/chaos` contract.

---

# 📡 API

### Gateway

```http
*
/api/*
```

Requests are routed through the gateway using the `x-api-key` header.

### Load Testing

```http
POST /api/load-tests/:runId/start
GET  /api/load-tests/:runId/live
GET  /api/load-tests/compare?baselineRunId=X&comparisonRunId=Y
```

### Incident Copilot

```http
POST /api/incidents/:id/analyze
POST /api/incidents/:id/summarize
POST /api/incidents/:id/resolve
```

---

# 📁 Project Structure

```text
traceform/
│
├── apps/
│   ├── api/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── models/
│   │   └── agents/
│   │
│   ├── gateway/
│   │   └── ...
│   │
│   ├── demo-service/
│   │   └── ...
│   │
│   └── load-worker/
│       └── ...
│
├── packages/
│   └── shared/
│
├── package.json
└── README.md
```

---

# ⚙️ Engineering Challenges

This project involved several real infrastructure problems rather than only implementing application-level features.

### Duplicate Mongoose Instances

Two copies of Mongoose resulted in separate connection registries and hanging queries.

**Solution:** Moved Mongoose to `peerDependencies` in the shared package so the application uses a single instance.

### Redis Pub/Sub TLS Failure

Redis Pub/Sub connections failed in the development environment while normal Redis commands continued to work.

**Solution:** Replaced the live-feed Pub/Sub implementation with Redis list polling.

### Kubernetes Worker Hanging

Workers completed their load tests but did not terminate because the Redis client continued retrying a failed connection.

**Solution:** Fixed the Redis/TLS configuration and changed the worker base image from Alpine to `node:20-slim`.

### Infinite Retry Problems

The project exposed an important systems pattern:

> A process that appears to "hang" may actually be alive and waiting forever on an external dependency.

This became particularly relevant when debugging Redis and queue behavior.

---

# ⚠️ Current Limitations

Traceform is intentionally transparent about what it does **not** currently provide.

* Load workers currently run inside Docker Desktop's single-node Kubernetes cluster.
* It does not simulate globally distributed traffic.
* Chaos injection requires the target service to implement the expected contract.
* Live traffic updates can have approximately one second of delay.
* Rate limiting currently uses a fixed 60-second window.
* No multi-tenant billing system.
* No team/role management beyond single-owner projects.
* Multi-pod percentile aggregation currently uses a worst-case approximation.

---

# 🗺️ Roadmap

* [ ] Deploy the gateway inside Kubernetes
* [ ] Replace fixed-window rate limiting with token-bucket/sliding-window limiting
* [ ] Add team workspaces
* [ ] Add role-based access control
* [ ] Build a dedicated run-comparison interface
* [ ] Restore Claude-based RCA when quota permits
* [ ] Deploy to managed Kubernetes
* [ ] Validate the architecture under production-scale infrastructure

---

# 🎯 Why Traceform?

Traceform was built as a systems-engineering project rather than a typical CRUD application.

The goal was to combine:

```text
Software Engineering
        +
Infrastructure
        +
Distributed Systems
        +
Observability
        +
Kubernetes
        +
AI Agents
```

into one cohesive system.

Instead of simply displaying metrics or sending prompts to an LLM, Traceform connects the complete reliability workflow:

```text
Traffic
   ↓
Telemetry
   ↓
Detection
   ↓
Incident
   ↓
Root Cause Analysis
   ↓
AI Summary
   ↓
Runbook
```

The result is an AI-native reliability platform that demonstrates application development, infrastructure orchestration, observability, distributed-system design, and agentic AI in one project.

---

# 📌 Project Status

**Status:** Active development

Traceform is currently a portfolio / engineering project focused on demonstrating production-oriented architecture and infrastructure concepts.

---

## Built With

**Node.js · Express · React · MongoDB · Redis · Kubernetes · LangChain · LangGraph · Mistral · Cohere · Claude · Socket.io · Redux Toolkit · Tailwind CSS**

---

## License

Add your preferred license here.
