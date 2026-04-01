URL:          http://127.0.0.1:8000
  Backend:      Anthropic (direct API)
  Mode:         token_headroom
  Optimization: ENABLED
  Caching:      ENABLED
  Rate Limit:   ENABLED
  Memory:       DISABLED
  License:      OSS (no license key)

Usage with Claude Code:
  ANTHROPIC_BASE_URL=http://127.0.0.1:8000 claude

Usage with OpenAI-compatible clients:
  OPENAI_BASE_URL=http://127.0.0.1:8000/v1 your-app

Endpoints:
  GET  /health     Health check
  GET  /stats      Detailed statistics
  GET  /metrics    Prometheus metrics
  POST /v1/messages           Anthropic API
  POST /v1/chat/completions   OpenAI API

Press Ctrl+C to stop.

2026-04-01 12:21:35,895 - headroom.transforms.cache_aligner - INFO - CacheAligner: DynamicContentDetector initialized with tiers: ['regex']

╔══════════════════════════════════════════════════════════════════════╗
║                      HEADROOM PROXY SERVER                           ║
╠══════════════════════════════════════════════════════════════════════╣
║  Version: 1.0.0                                                      ║
║  Listening: http://127.0.0.1:8000                                       ║
║  Workers: 1    Concurrency Limit: 1000                           ║
║  Backend: ANTHROPIC (direct API)                                     ║
╠══════════════════════════════════════════════════════════════════════╣
║  FEATURES:                                                           ║
║    Optimization:    ENABLED                                        ║
║    Caching:         ENABLED    (TTL: 3600s)                          ║
║    Rate Limiting:   ENABLED    (60 req/min, 100,000 tok/min)       ║
║    Retry:           ENABLED    (max 3 attempts)                       ║
║    Cost Tracking:   ENABLED    (budget: unlimited)          ║
║    Code-Aware:      ENABLED  (AST-based)                                ║
║    HTTP/2:          ENABLED                                             ║
║    Conn Pool:       max=500, keepalive=100                              ║
╠══════════════════════════════════════════════════════════════════════╣
║  USAGE:                                                              ║
║    Claude Code:   ANTHROPIC_BASE_URL=http://127.0.0.1:8000 claude     ║
║    Cursor:        Set base URL in settings                           ║
╠══════════════════════════════════════════════════════════════════════╣
║  ENDPOINTS:                                                          ║
║    /health                  Health check                             ║
║    /stats                   Detailed statistics                      ║
║    /metrics                 Prometheus metrics                       ║
║    /cache/clear             Clear response cache                     ║
║    /v1/retrieve             CCR: Retrieve compressed content         ║
║    /v1/retrieve/stats       CCR: Compression store stats             ║
║    /v1/retrieve/tool_call   CCR: Handle LLM tool calls               ║
║    /v1/feedback             CCR: Feedback loop stats & patterns      ║
║    /v1/feedback/{tool}    CCR: Compression hints for a tool        ║
║    /v1/telemetry            Data flywheel: Telemetry stats           ║
║    /v1/telemetry/export     Data flywheel: Export for aggregation    ║
║    /v1/telemetry/tools      Data flywheel: Per-tool stats            ║
║    /v1/toin/stats           TOIN: Overall intelligence stats         ║
║    /v1/toin/patterns        TOIN: List learned patterns              ║
║    /v1/toin/pattern/{hash} TOIN: Pattern details by hash            ║
╚══════════════════════════════════════════════════════════════════════╝

2026-04-01 12:21:37,192 - headroom.proxy - INFO - Headroom Proxy started
2026-04-01 12:21:37,194 - headroom.proxy - INFO - Optimization: ENABLED
2026-04-01 12:21:37,195 - headroom.proxy - INFO - Mode: token_headroom
2026-04-01 12:21:37,196 - headroom.proxy - INFO -   Prefix freeze: re-freeze after compression
2026-04-01 12:21:37,196 - headroom.proxy - INFO -   Read protection window: 30%% of excluded-tool messages
2026-04-01 12:21:37,197 - headroom.proxy - INFO -   CCR TTL: extended for session lifetime
2026-04-01 12:21:37,198 - headroom.proxy - INFO -   Compression cache: active
2026-04-01 12:21:37,198 - headroom.proxy - INFO - Caching: ENABLED
2026-04-01 12:21:37,198 - headroom.proxy - INFO - Rate Limiting: ENABLED
2026-04-01 12:21:37,199 - headroom.proxy - INFO - Connection Pool: max_connections=500, max_keepalive=100, http2=ENABLED
2026-04-01 12:21:37,200 - headroom.proxy - INFO - Smart Routing: ENABLED (intelligent content detection)
2026-04-01 12:21:37,200 - headroom.proxy - INFO - Pre-loading compressors and parsers...
2026-04-01 12:21:37,212 - headroom.transforms.content_router - INFO - Kompress model pre-loaded at startup
2026-04-01 12:21:37,440 - headroom.transforms.content_router - INFO - Magika content detector pre-loaded at startup
2026-04-01 12:21:37,977 - headroom.transforms.content_router - INFO - Tree-sitter parsers pre-loaded: python, javascript, typescript, go, rust, java, c, cpp
2026-04-01 12:21:37,978 - headroom.proxy - INFO - Kompress: ENABLED (ModernBERT token compressor)
2026-04-01 12:21:37,980 - headroom.proxy - INFO - Code-Aware: ENABLED (AST-based compression)
2026-04-01 12:21:37,980 - headroom.proxy - INFO - Tree-Sitter: loaded (8 languages)
2026-04-01 12:21:37,981 - headroom.proxy - INFO - Magika: ENABLED (ML content detection)
2026-04-01 12:21:37,982 - headroom.proxy - INFO - CCR (Compress-Cache-Retrieve): ENABLED (tool_injection, response_handling, context_tracking, proactive_expansion)
2026-04-01 12:21:37,982 - headroom.proxy - INFO - Savings history: C:\Users\Usuario\.headroom\proxy_savings.json
2026-04-01 12:21:37,986 - headroom.telemetry.beacon - INFO - Telemetry: ENABLED (anonymous aggregate stats, opt out: HEADROOM_TELEMETRY=off)