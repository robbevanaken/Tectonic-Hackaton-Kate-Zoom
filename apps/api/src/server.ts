import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { me } from "./routes/me.js";
import { handoff } from "./routes/handoff.js";
import { kateEnabled } from "./engine/kate.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const ORIGINS = (process.env.CORS_ORIGINS ?? "http://localhost:5180").split(",").map((s) => s.trim());

app.disable("x-powered-by");
app.use(
  helmet({
    // JSON-only API: nothing may be loaded, framed or executed from its responses.
    contentSecurityPolicy: { useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] } },
    frameguard: { action: "deny" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "no-referrer" },
  }),
);
app.use(cors({ origin: ORIGINS, credentials: false, methods: ["GET", "POST"], allowedHeaders: ["Authorization", "Content-Type"], maxAge: 600 }));
app.use(express.json({ limit: "10kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false }));
// Tighter limits where abuse would hurt: token redemption and anything that shares or moves data.
const strict = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false });
app.use("/api/handoff", strict);
app.use(/^\/api\/me\/(insights\/[^/]+\/handoff|invest|export)/, strict);

app.get("/api/health", (_req, res) => res.json({ ok: true, kate: kateEnabled() ? "claude" : "template" }));
app.use("/api/me", me);
app.use("/api/handoff", handoff);

// Never leak stack traces.
app.use((_req, res) => res.status(404).json({ error: "not_found" }));
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log the error class only: messages can contain request data (PII).
  console.error("request failed:", err instanceof Error ? err.name : "unknown");
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "invalid_json" });
    return;
  }
  res.status(500).json({ error: "internal_error" });
});

app.listen(PORT, () => {
  console.log(`Kate Zoom API on http://localhost:${PORT} (explanations: ${kateEnabled() ? "claude" : "template"})`);
});
