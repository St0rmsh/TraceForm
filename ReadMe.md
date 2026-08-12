<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Traceform — Technical Notes</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Fraunces:ital,wght@0,300;0,600;0,700;0,900;1,300;1,600;1,700;1,900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
<style>
  :root{
    --ink:#0E0F14; --paper:#F5F2EB; --paper2:#EDE9DF; --paper3:#E4DFD3; --rule:#D4CEBC;
    --muted:#6B6455; --accent:#C84B1F; --accent2:#1A6B4A; --accent3:#1B4587; --gold:#B8860B;
    --code-bg:#1A1C24; --code-text:#E2DCCC; --flag-c:#5BA4CF; --val-c:#F4A261;
  }
  *{box-sizing:border-box; margin:0; padding:0;}
  body{
    font-family:'DM Sans', sans-serif; background:var(--paper); color:var(--ink);
    line-height:1.6;
  }
  a{color:inherit;}
  .layout{display:flex; min-height:100vh;}

  /* ===== SIDEBAR ===== */
  .sidebar{
    width:260px; background:var(--ink); color:#fff; position:sticky; top:0;
    height:100vh; overflow-y:auto; padding:32px 0; flex-shrink:0;
  }
  .sidebar-brand{
    font-family:'IBM Plex Mono', monospace; font-size:13px; letter-spacing:0.05em;
    padding:0 28px 24px; color:var(--accent); text-transform:uppercase;
  }
  .sidebar nav{display:flex; flex-direction:column;}
  .sidebar a{
    font-family:'IBM Plex Mono', monospace; font-size:12.5px; padding:10px 28px;
    color:rgba(255,255,255,.55); text-decoration:none; border-left:2px solid transparent;
    display:flex; gap:10px; transition:all .15s ease;
  }
  .sidebar a:hover{color:#fff; background:rgba(255,255,255,.04);}
  .sidebar a.active{color:#fff; border-left:2px solid var(--accent); background:rgba(200,75,31,.08);}
  .sidebar a .n{color:rgba(255,255,255,.3);}

  /* ===== MAIN ===== */
  main{flex:1; padding:56px; max-width:920px;}

  /* ===== HERO ===== */
  .eyebrow{
    font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--accent);
    text-transform:uppercase; letter-spacing:.1em; margin-bottom:18px;
  }
  h1.headline{
    font-family:'Fraunces', serif; font-weight:900; font-size:56px; line-height:1.05;
    margin-bottom:20px; letter-spacing:-0.01em;
  }
  h1.headline em{font-style:italic; color:var(--accent); font-weight:700;}
  .hero-desc{font-size:17px; color:var(--muted); max-width:640px; margin-bottom:24px;}
  .pills{display:flex; flex-wrap:wrap; gap:8px; margin-bottom:56px;}
  .pill{
    font-family:'IBM Plex Mono', monospace; font-size:11.5px; padding:6px 14px;
    border:1px solid var(--rule); border-radius:20px; color:var(--muted); background:var(--paper2);
  }

  /* ===== SECTIONS ===== */
  section{margin-bottom:64px; opacity:0; animation:fadeUp .5s ease forwards;}
  .sec-head{display:flex; gap:20px; align-items:baseline; margin-bottom:24px; border-bottom:2px solid var(--rule); padding-bottom:16px;}
  .sec-num{font-family:'Fraunces', serif; font-size:48px; font-weight:900; color:var(--rule); line-height:1;}
  .sec-title{font-family:'Fraunces', serif; font-size:28px; font-weight:700;}
  .sec-sub{font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--muted); margin-top:4px;}
  p{margin-bottom:14px; font-size:15px;}
  ul, ol{margin:0 0 14px 20px; font-size:15px;}
  li{margin-bottom:6px;}
  strong{font-weight:600;}

  @keyframes fadeUp{from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:translateY(0);}}

  /* ===== INLINE CODE ===== */
  code.inline{
    font-family:'IBM Plex Mono', monospace; color:var(--accent); background:var(--paper3);
    border:1px solid var(--rule); border-radius:4px; padding:1px 5px; font-size:13.5px;
  }

  /* ===== CODE BLOCKS ===== */
  .code-block{background:var(--code-bg); border-radius:8px; overflow:hidden; margin:20px 0;}
  .code-header{
    display:flex; justify-content:space-between; align-items:center; padding:10px 16px;
    background:rgba(255,255,255,.04); font-family:'IBM Plex Mono', monospace; font-size:11.5px;
    color:rgba(255,255,255,.5); border-bottom:1px solid rgba(255,255,255,.06);
  }
  .copy-btn{
    font-family:'IBM Plex Mono', monospace; font-size:10.5px; color:rgba(255,255,255,.5);
    background:rgba(255,255,255,.06); border:none; padding:4px 10px; border-radius:4px; cursor:pointer;
  }
  .code-block pre{padding:18px 20px; overflow-x:auto; font-family:'IBM Plex Mono', monospace; font-size:13px; color:var(--code-text); line-height:1.7;}
  .cmd{color:#87CEEB;} .flag{color:#5BA4CF;} .val{color:#F4A261;}
  .str{color:#98C379;} .cmt{color:rgba(255,255,255,.28); font-style:italic;} .kw{color:#C678DD;}

  /* ===== CONCEPT CALLOUT ===== */
  .concept{
    background:var(--paper2); border-left:3px solid var(--accent3); border-radius:0 8px 8px 0;
    padding:16px 20px; margin:20px 0;
  }
  .concept-label{
    font-family:'IBM Plex Mono', monospace; font-size:10.5px; color:var(--accent3);
    text-transform:uppercase; letter-spacing:.08em; margin-bottom:8px; font-weight:600;
  }

  /* ===== NOTE / WARNING ===== */
  .note, .warning{border-radius:8px; padding:16px 20px; margin:20px 0; display:flex; gap:12px;}
  .note{background:#FEF9EC; border:1px solid #EDD97A; color:#5C4A00;}
  .warning{background:#FEF2F2; border:1px solid #FCA5A5; color:#7F1D1D;}
  .note .icon, .warning .icon{font-size:18px; flex-shrink:0;}

  /* ===== STEP PILLS ===== */
  .step-pill{
    font-family:'IBM Plex Mono', monospace; font-size:11px; color:#fff; border-radius:4px;
    padding:3px 9px; display:inline-block;
  }
  .step-pill.red{background:var(--accent);} .step-pill.green{background:var(--accent2);}
  .step-pill.blue{background:var(--accent3);} .step-pill.gold{background:var(--gold);}

  /* ===== FLOW DIAGRAM ===== */
  .flow{margin:24px 0;}
  .flow-step{display:flex; gap:16px; align-items:flex-start;}
  .flow-marker{display:flex; flex-direction:column; align-items:center;}
  .flow-dot{width:10px; height:10px; border-radius:50%; background:var(--accent); flex-shrink:0; margin-top:4px;}
  .flow-line{width:2px; flex:1; background:var(--rule); min-height:36px;}
  .flow-content{padding-bottom:24px;}
  .flow-content .ft{font-family:'IBM Plex Mono', monospace; font-size:13px; font-weight:600; margin-bottom:3px;}
  .flow-content .fd{font-size:13.5px; color:var(--muted);}

  /* ===== TABLES ===== */
  table{width:100%; border-collapse:collapse; margin:20px 0; font-size:13.5px;}
  .flagtable th{
    font-family:'IBM Plex Mono', monospace; font-size:11px; text-transform:uppercase;
    text-align:left; padding:10px 14px; color:var(--muted); border-bottom:2px solid var(--rule);
  }
  .flagtable td{padding:10px 14px; border-bottom:1px solid var(--rule); font-family:'IBM Plex Mono', monospace; font-size:13px;}
  .flagtable tr:hover{background:var(--paper2);}
  .flagtable .fname{color:var(--flag-c);}
  .flagtable .fval{color:var(--val-c);}

  .comptable th{background:var(--ink); color:#fff; padding:12px 14px; text-align:left; font-family:'IBM Plex Mono', monospace; font-size:11.5px; text-transform:uppercase;}
  .comptable td{padding:12px 14px; border-bottom:1px solid var(--rule); font-size:13.5px;}
  .comptable tr:nth-child(even){background:var(--paper2);}
  .comptable tr:hover td{background:var(--paper3);}

  footer{
    display:flex; justify-content:space-between; font-family:'IBM Plex Mono', monospace;
    font-size:11px; color:var(--muted); border-top:2px solid var(--rule); padding-top:20px; margin-top:40px;
  }

  @media (max-width: 900px){
    .layout{flex-direction:column;}
    .sidebar{width:100%; height:auto; position:relative;}
    main{padding:28px;}
    h1.headline{font-size:36px;}
  }
</style>
</head>
<body>
<div class="layout">

  <aside class="sidebar">
    <div class="sidebar-brand">◈ Traceform Notes</div>
    <nav>
      <a href="#overview" class="active"><span class="n">01</span> Overview</a>
      <a href="#architecture"><span class="n">02</span> Architecture</a>
      <a href="#stack"><span class="n">03</span> Tech Stack</a>
      <a href="#features"><span class="n">04</span> Core Features</a>
      <a href="#ai"><span class="n">05</span> AI Layer</a>
      <a href="#debugging"><span class="n">06</span> Hard Bugs Solved</a>
      <a href="#limits"><span class="n">07</span> What It Doesn't Do</a>
      <a href="#improvements"><span class="n">08</span> Future Improvements</a>
      <a href="#api"><span class="n">09</span> API Reference</a>
    </nav>
  </aside>

  <main>
    <div class="eyebrow">// portfolio project — reliability engineering</div>
    <h1 class="headline">Traceform: an <em>AI-native</em><br/>traffic &amp; reliability platform</h1>
    <p class="hero-desc">
      A reverse-proxy gateway, a Kubernetes-orchestrated chaos/load-testing engine, and a multi-agent
      AI incident copilot — built end to end as a single system, with 23 backend features and a
      React frontend, to demonstrate systems engineering, infrastructure orchestration, and applied
      LLM agent design in one project.
    </p>
    <div class="pills">
      <span class="pill">Node.js / Express</span>
      <span class="pill">MongoDB + Redis</span>
      <span class="pill">Kubernetes</span>
      <span class="pill">LangChain / LangGraph</span>
      <span class="pill">Mistral · Cohere · Claude</span>
      <span class="pill">Socket.io</span>
      <span class="pill">React + Redux Toolkit</span>
      <span class="pill">Tailwind v4</span>
    </div>

    <!-- 01 OVERVIEW -->
    <section id="overview" style="animation-delay:.05s">
      <div class="sec-head">
        <span class="sec-num">01</span>
        <div><div class="sec-title">Overview</div><div class="sec-sub">what we built, and why</div></div>
      </div>

      <p><strong>What it is:</strong> Traceform sits in front of a target backend service as a reverse
      proxy, capturing every request that passes through. On top of that traffic data, it layers three
      things a real reliability team would want: live visibility (health status, live traffic feed),
      controlled stress-testing (Kubernetes-orchestrated load tests with optional chaos injection), and
      automated incident response (anomaly detection → auto-created incidents → AI root-cause analysis →
      AI-written summaries and runbooks).</p>

      <p><strong>Why we built it:</strong> the goal was a single portfolio project that couldn't be faked
      with a tutorial clone — something that forces genuine systems-engineering decisions (how do a proxy
      and a control-plane API talk to each other without coupling them?), genuine infrastructure work
      (actually creating and tearing down Kubernetes pods, not just talking about Kubernetes), and genuine
      AI-agent design (a real multi-node LangGraph pipeline with a distinct reasoning step and a distinct
      review step, not one prompt dressed up as "AI").</p>

      <div class="concept">
        <div class="concept-label">Key Concept</div>
        The three pillars — <strong>traffic gateway</strong>, <strong>load/chaos testing</strong>, and
        <strong>incident copilot</strong> — share one data spine. The gateway captures real traffic;
        the load-test workers generate synthetic traffic through the same path; the incident copilot
        reasons over both. Nothing is siloed.
      </div>
    </section>

    <!-- 02 ARCHITECTURE -->
    <section id="architecture" style="animation-delay:.1s">
      <div class="sec-head">
        <span class="sec-num">02</span>
        <div><div class="sec-title">Architecture</div><div class="sec-sub">how the pieces fit together</div></div>
      </div>

      <p>Four separate applications in an npm-workspaces monorepo, each with a single clear job:</p>

      <table class="comptable">
        <thead><tr><th>Service</th><th>Role</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td><code class="inline">apps/api</code></td><td>Control plane</td><td>Auth, projects, orchestration, AI agents — the "brain"</td></tr>
          <tr><td><code class="inline">apps/gateway</code></td><td>Data plane</td><td>Lean reverse proxy — must stay fast, minimal dependencies</td></tr>
          <tr><td><code class="inline">apps/demo-service</code></td><td>Synthetic target</td><td>Mock service with a built-in chaos-injection API</td></tr>
          <tr><td><code class="inline">apps/load-worker</code></td><td>K8s pod payload</td><td>Not a service — runs once per pod, reports results, exits</td></tr>
        </tbody>
      </table>

      <div class="flow">
        <div class="flow-step">
          <div class="flow-marker"><div class="flow-dot"></div><div class="flow-line"></div></div>
          <div class="flow-content">
            <div class="ft">Client request → Gateway</div>
            <div class="fd">Gateway resolves the caller's project via <code class="inline">x-api-key</code>, cached in Redis (30s TTL) to avoid a Mongo hit on every request.</div>
          </div>
        </div>
        <div class="flow-step">
          <div class="flow-marker"><div class="flow-dot"></div><div class="flow-line"></div></div>
          <div class="flow-content">
            <div class="ft">Gateway → Target service</div>
            <div class="fd">Request is proxied through via <code class="inline">http-proxy-middleware</code>; latency and status are captured on the response.</div>
          </div>
        </div>
        <div class="flow-step">
          <div class="flow-marker"><div class="flow-dot"></div><div class="flow-line"></div></div>
          <div class="flow-content">
            <div class="ft">Capture → Redis + Mongo</div>
            <div class="fd">Written to a Redis hot-log list (powers live feed + health) and a flush queue batch-drained into MongoDB every 5s for durable history.</div>
          </div>
        </div>
        <div class="flow-step">
          <div class="flow-marker"><div class="flow-dot"></div></div>
          <div class="flow-content">
            <div class="ft">Background scanner → Incident</div>
            <div class="fd">Every 20s, all active projects are scanned for anomalies; a breach auto-creates a real Incident document, deduped per breach episode.</div>
          </div>
        </div>
      </div>

      <div class="concept">
        <div class="concept-label">Key Concept</div>
        The gateway and API <strong>never call each other directly</strong>. They communicate only
        through shared MongoDB and Redis. This means the fast, high-traffic path (the gateway) is never
        blocked by anything slow happening in the control plane (K8s calls, AI calls).
      </div>
    </section>

    <!-- 03 TECH STACK -->
    <section id="stack" style="animation-delay:.15s">
      <div class="sec-head">
        <span class="sec-num">03</span>
        <div><div class="sec-title">Tech Stack &amp; Rationale</div><div class="sec-sub">what we used, and why that thing specifically</div></div>
      </div>

      <table class="flagtable">
        <thead><tr><th>Technology</th><th>Used for</th><th>Why this, specifically</th></tr></thead>
        <tbody>
          <tr><td class="fname">http-proxy-middleware</td><td>Reverse proxy core</td><td>Genuine proxy logic in Express, fully explainable — vs. an off-the-shelf Envoy/Nginx black box</td></tr>
          <tr><td class="fname">Redis (ephemeral)</td><td>Hot metrics, caching, dedup flags</td><td>Every key TTL'd on purpose — Redis is disposable working memory, Mongo is the record</td></tr>
          <tr><td class="fname">@kubernetes/client-node</td><td>Dynamic Job orchestration</td><td>Real K8s API calls building Job specs in code — not static YAML, not shelling to kubectl</td></tr>
          <tr><td class="fname">autocannon</td><td>Load generation inside pods</td><td>Gives connection-based load gen <em>and</em> latency percentiles for free — no hand-rolled math</td></tr>
          <tr><td class="fname">LangGraph</td><td>Root-cause agent chain</td><td>Genuine multi-node state graph (gather → analyze → synthesize), not one prompt</td></tr>
          <tr><td class="fname">Mistral / Cohere / Claude</td><td>Three AI features</td><td>Free-tier quota spread deliberately across providers rather than exhausting one</td></tr>
          <tr><td class="fname">Socket.io + polling</td><td>Live traffic feed</td><td>Started as pub/sub, pivoted to polling after a real environment-specific TLS bug — see §06</td></tr>
          <tr><td class="fname">Redux Toolkit</td><td>Frontend state</td><td>Five-layer feature architecture (api → services → state → hooks → ui) per feature</td></tr>
        </tbody>
      </table>
    </section>

    <!-- 04 CORE FEATURES -->
    <section id="features" style="animation-delay:.2s">
      <div class="sec-head">
        <span class="sec-num">04</span>
        <div><div class="sec-title">Core Features</div><div class="sec-sub">23 backend features across 4 phases</div></div>
      </div>

      <p><span class="step-pill blue">PHASE 1</span> Auth, project registration with per-project API keys,
      a synthetic demo service with a chaos-injection API, dashboard aggregation.</p>
      <p><span class="step-pill red">PHASE 2</span> Reverse proxy, request capture, live Socket.io traffic
      feed, per-route health status (green/yellow/red), Redis-backed rate limiting.</p>
      <p><span class="step-pill green">PHASE 3</span> Load test config, real K8s worker orchestration,
      live run progress, auto-applied chaos conditions, AI bottleneck analysis, run comparison with deltas.</p>
      <p><span class="step-pill gold">PHASE 4</span> Background anomaly detection, auto/manual incident
      creation, LangGraph root-cause chain, AI incident summaries with runbooks, timeline, resolution.</p>

      <div class="code-block">
        <div class="code-header"><span>example — creating a chaos-injected load test</span><button class="copy-btn">Copy</button></div>
        <pre><span class="cmd">POST</span> /api/projects/:projectId/load-tests
<span class="kw">Authorization</span>: <span class="val">Bearer &lt;token&gt;</span>

{
  <span class="str">"name"</span>: <span class="str">"Chaos load test"</span>,
  <span class="str">"config"</span>: {
    <span class="str">"route"</span>: <span class="str">"/api/products"</span>,
    <span class="flag">"endRps"</span>: <span class="val">10</span>,
    <span class="flag">"durationSeconds"</span>: <span class="val">15</span>,
    <span class="flag">"concurrency"</span>: <span class="val">2</span>  <span class="cmt">// = 2 real parallel K8s pods</span>
  },
  <span class="str">"chaos"</span>: { <span class="flag">"errorRatePercent"</span>: <span class="val">40</span> }
}</pre>
      </div>
    </section>

    <!-- 05 AI LAYER -->
    <section id="ai" style="animation-delay:.25s">
      <div class="sec-head">
        <span class="sec-num">05</span>
        <div><div class="sec-title">The AI Layer</div><div class="sec-sub">three distinct agent patterns, on purpose</div></div>
      </div>

      <p>Rather than using one LLM pattern everywhere, three different shapes were used deliberately,
      to actually demonstrate range:</p>

      <ol>
        <li><strong>Single-call summarization</strong> (Mistral) — post-run bottleneck analysis, incident
        summaries. One prompt, one structured-ish output.</li>
        <li><strong>Multi-node LangGraph chain</strong> (Cohere, originally Claude) — root-cause analysis
        runs three real nodes: a pure-data <code class="inline">gatherContext</code> node, an
        <code class="inline">analyze</code> node that reasons freely, and a <code class="inline">synthesize</code>
        node that forces the free-form reasoning into strict JSON (<code class="inline">rootCause</code>,
        <code class="inline">confidence</code>, <code class="inline">contributingFactors</code>).</li>
        <li><strong>Layered agent output</strong> — the incident-summary prompt is given the root-cause
        analysis as part of its own context, so the two AI features build on each other instead of
        duplicating reasoning.</li>
      </ol>

      <div class="note">
        <span class="icon">💡</span>
        <div>All AI actions are <strong>on-demand</strong> (<code class="inline">POST /analyze</code>,
        <code class="inline">POST /summarize</code>), never automatic. With three free-tier providers in
        play, firing a call on every 20-second anomaly scan would exhaust quota fast — a person decides
        when analysis is actually worth the call.</div>
      </div>
    </section>

    <!-- 06 DEBUGGING -->
    <section id="debugging" style="animation-delay:.3s">
      <div class="sec-head">
        <span class="sec-num">06</span>
        <div><div class="sec-title">Hard Bugs, Actually Solved</div><div class="sec-sub">the parts that make this a real project, not a tutorial</div></div>
      </div>

      <p>Four separate, genuinely difficult bugs — three of them the same underlying class, discovered
      independently each time before the pattern was recognized.</p>

      <div class="concept">
        <div class="concept-label">Bug 01 — Duplicate Mongoose Instances</div>
        <code class="inline">mongoose</code> was a normal dependency in both <code class="inline">apps/api</code>
        and <code class="inline">packages/shared</code>. Two copies of the library meant two separate
        connection registries — queries would hang forever with no error. <strong>Fix:</strong> made
        mongoose a <code class="inline">peerDependency</code> in the shared package, forcing one shared instance.
      </div>

      <div class="concept">
        <div class="concept-label">Bug 02 — Redis Pub/Sub Silently Failing</div>
        A dedicated Redis <code class="inline">SUBSCRIBE</code> connection threw a persistent TLS error in
        this exact environment (Windows OpenSSL + Redis Cloud's TLS proxy), while normal command connections
        worked perfectly. Diagnosed by isolating a single fresh process to rule out connection pile-up.
        <strong>Fix:</strong> dropped pub/sub for the live feed entirely — the API now polls the same
        Redis list every 1s using plain <code class="inline">LRANGE</code>.
      </div>

      <div class="concept">
        <div class="concept-label">Bug 03 — K8s Pods Hanging Forever</div>
        Two layers: Alpine's musl-based OpenSSL had TLS issues talking to Redis Cloud (fixed by switching
        the worker image to <code class="inline">node:20-slim</code>), then a mismatched
        <code class="inline">REDIS_TLS</code> env var caused the worker's Redis client to attempt TLS
        against a plain endpoint — and since <code class="inline">ioredis</code> retries forever by
        default, the pod's Node process never called <code class="inline">process.exit()</code>, even
        though the actual load test had already finished successfully.
      </div>

      <div class="warning">
        <span class="icon">⚠</span>
        <div><strong>The pattern:</strong> "the process hangs and never exits" is the signature of an
        infinite-retry client waiting on a connection that will never succeed. This exact symptom recurred
        a fourth time with BullMQ's internal Lua-scripted queue operations — same diagnosis, same fix:
        drop the advanced feature, rebuild on the simple primitives (GET/SET/LPUSH) that were proven reliable.</div>
      </div>
    </section>

    <!-- 07 LIMITS -->
    <section id="limits" style="animation-delay:.35s">
      <div class="sec-head">
        <span class="sec-num">07</span>
        <div><div class="sec-title">What It Doesn't Do</div><div class="sec-sub">honest limitations, stated plainly</div></div>
      </div>

      <ul>
        <li>Load-generator pods run inside <strong>Docker Desktop's single-node local cluster</strong> —
        this proves K8s orchestration skill, but it is not simulating real distributed traffic from
        multiple datacenters.</li>
        <li>Chaos injection only works against a target that implements the same <code class="inline">/chaos</code>
        contract as the bundled demo service — a real production target wouldn't have this unless it opted in.</li>
        <li>The live traffic feed has up to ~1s of latency (polling), not true instant push.</li>
        <li>Rate limiting is a fixed 60-second window, not a sliding window or token bucket — bursts right
        at window boundaries can briefly exceed the stated limit.</li>
        <li>No multi-tenant billing, no team/role management beyond single-owner projects.</li>
        <li>Percentile aggregation across multiple load-test pods uses max-of-pods (a documented worst-case
        approximation), not statistically precise percentile merging.</li>
      </ul>
    </section>

    <!-- 08 IMPROVEMENTS -->
    <section id="improvements" style="animation-delay:.4s">
      <div class="sec-head">
        <span class="sec-num">08</span>
        <div><div class="sec-title">Future Improvements</div><div class="sec-sub">what's next, if this kept going</div></div>
      </div>

      <ul>
        <li>Deploy the gateway itself <em>inside</em> the K8s cluster instead of as a host process, for a
        fully-in-cluster architecture story.</li>
        <li>Sliding-window or token-bucket rate limiting instead of fixed window.</li>
        <li>Team workspaces and role-based access, deferred from the original feature plan.</li>
        <li>A dedicated run-comparison picker UI (currently requires typing in run IDs manually).</li>
        <li>Move root-cause analysis back to Claude once quota allows, per the original design.</li>
        <li>Production deployment target (managed K8s) to validate the architecture beyond local dev.</li>
      </ul>
    </section>

    <!-- 09 API -->
    <section id="api" style="animation-delay:.45s">
      <div class="sec-head">
        <span class="sec-num">09</span>
        <div><div class="sec-title">API Reference (excerpt)</div><div class="sec-sub">representative endpoints across the three pillars</div></div>
      </div>

      <div class="code-block">
        <div class="code-header"><span>selected endpoints</span><button class="copy-btn">Copy</button></div>
        <pre><span class="cmt"># Gateway (data plane)</span>
<span class="cmd">*</span>    /api/*                          <span class="cmt"># proxied via x-api-key header</span>

<span class="cmt"># Load testing / chaos</span>
<span class="cmd">POST</span> /api/load-tests/:runId/start   <span class="cmt"># triggers real K8s Job</span>
<span class="cmd">GET</span>  /api/load-tests/:runId/live    <span class="cmt"># live progress while running</span>
<span class="cmd">GET</span>  /api/load-tests/compare?baselineRunId=X&amp;comparisonRunId=Y

<span class="cmt"># Incident copilot</span>
<span class="cmd">POST</span> /api/incidents/:id/analyze     <span class="cmt"># LangGraph root-cause chain</span>
<span class="cmd">POST</span> /api/incidents/:id/summarize   <span class="cmt"># AI summary + runbook</span>
<span class="cmd">POST</span> /api/incidents/:id/resolve</pre>
      </div>
    </section>

    <footer>
      <span>TRACEFORM — TECHNICAL NOTES</span>
      <span>BUILT WITH NODE, MONGO, REDIS, K8S, LANGCHAIN, REACT</span>
    </footer>
  </main>
</div>

<script>
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-block').querySelector('pre');
      navigator.clipboard.writeText(pre.innerText);
      btn.textContent = 'Copied';
      setTimeout(() => btn.textContent = 'Copy', 1500);
    });
  });

  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.sidebar a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.sidebar a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => observer.observe(s));
</script>
</body>
</html>