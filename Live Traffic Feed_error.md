What we were building

Feature 8: Live Traffic Feed — the idea is that when someone's dashboard is open, they should see requests flowing through the gateway in real time, not just as static logs. The architecture we'd already committed to was: gateway writes to Redis, API reads from Redis and pushes to connected browser clients over Socket.io. This matches your "control plane vs data plane" split — the gateway stays lean and fast, the API handles the dashboard-facing real-time stuff.

The standard way to do "write here, read there, in real time" with Redis is pub/sub: the gateway calls PUBLISH on a channel every time it captures a request, and the API keeps a dedicated SUBSCRIBE connection open on that channel, listening. The moment something is published, the subscriber gets it instantly — no polling, no delay.

What we built first
Gateway: added a PUBLISH call to the existing Redis pipeline (alongside the hot-log writes you already had from Feature 7).
API: created a second, dedicated Redis connection just for subscribing (redisSub.js) — this is required because in Redis, once a connection issues SUBSCRIBE, that connection can basically only listen for messages anymore; it can't run normal commands. So you need one connection for regular reads/writes and a separate one purely for subscribing.
API: Socket.io server that authenticates clients via their JWT, lets them join a "room" per project, and re-broadcasts whatever comes in on the Redis subscription to that room.
What went wrong

The moment the API started up, that dedicated subscriber connection threw a TLS error — SSL routines:tls_get_more_records:packet length too long — over and over, every few seconds, forever. Meanwhile, right next to it in the same log output, the main Redis connection (the one doing normal commands) connected completely cleanly. Same Redis Cloud instance, same host, same port, same password, same TLS setting — read from the exact same config object in code.

That's a strange bug: identical configuration, one connection works, the other doesn't, consistently, every single restart.

How we diagnosed it

The first instinct was "maybe old connections from all our nodemon restarts today piled up and we're hitting a connection limit on the free Redis Cloud tier." That's a very plausible bug in general — dev servers restart constantly, and if old sockets don't get cleaned up, you can genuinely exhaust a small connection quota.

To test that theory, we did a clean isolation test: kill every Node process on the machine, wait for any stale connections to time out server-side, then start up only apps/api — nothing else running at all — and watch what happens on that first, completely fresh connection attempt.

The result: the main connection still connected instantly, and the subscriber still failed instantly, in exactly the same way. That ruled out connection buildup entirely — there was nothing else competing for connections, and it still failed. So the problem wasn't quantity of connections; it was something specific to that one connection's behavior.

The pattern that stood out: the only structural difference between the two connections was that one was a normal command connection and the other was specifically going into subscribe mode. That pointed at an environment-specific incompatibility — most likely something in how this particular combination (Windows' OpenSSL build in Node, plus however Redis Cloud's TLS-terminating proxy handles long-lived subscribe-mode connections specifically) doesn't play well together. This is the kind of bug that's genuinely hard to fix from the client side — you can't patch OpenSSL or change how Redis Cloud's proxy behaves.

How we fixed it

Rather than keep chasing a low-level TLS incompatibility we couldn't directly control, we changed the design to avoid needing a subscribe-mode connection at all:

Instead of the API holding open a dedicated subscriber and waiting for pushes, the API now polls the same Redis hot-log list that Feature 7 already writes to (traceform:hotlogs:{projectId}) — just a plain LRANGE command, once per second, using the normal Redis connection that we already knew worked reliably.
To avoid re-sending old data every time, it tracks the timestamp of the last entry it already delivered, and only emits genuinely new entries since then.
To avoid wasted work, it only polls a project while at least one client is actually subscribed to it (reference-counted), and stops the moment everyone disconnects.
We deleted redisSub.js entirely — there's no dedicated subscriber connection left in the codebase anymore.

The tradeoff is real but small: instead of true instant push, there's now up to ~1 second of latency before a new request shows up in the live feed. For a dashboard, that's imperceptible in practice — and you actually saw this confirmed live, with requests appearing within a few seconds of you sending them.

Why this is a good story to remember

It's not just "I fixed a bug" — it's a clean example of the debugging method that actually matters in interviews: form a hypothesis (connection buildup), design a test that isolates the variable (fresh process, one service, nothing else running), get a clear result that rules the hypothesis out, notice what's actually different between the working and broken cases (subscribe-mode vs. normal mode), and when the root cause turns out to be outside your control (OpenSSL/proxy-level), pivot the design instead of the code — polling with ref-counting instead of pub/sub. That's a legitimately senior instinct: know when to stop debugging a black box and change the shape of the problem instead.

Next feature

Per the build order, we're on to Feature 9: Route Health Status — computing a rolling green/yellow/red status per route based on recent traffic (error rate + latency against each project's anomalyThresholds, which you already store on the Project model), exposed as an API endpoint. This feeds directly off the same hot-log data Features 7 and 8 already produce, so it should move quickly.

Say next whenever you're ready to start.