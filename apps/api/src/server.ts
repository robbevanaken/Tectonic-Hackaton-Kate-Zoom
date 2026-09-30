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
app.use(helmet());
app.use(cors({ origin: ORIGINS, credentials: false }));
app.use(express.json({ limit: "10kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", (_req, res) => res.json({ ok: true, kate: kateEnabled() ? "claude" : "template" }));
app.use("/api/me", me);
app.use("/api/handoff", handoff);

// Never leak stack traces.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err instanceof Error ? err.message : err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(PORT, () => {
  console.log(`Kate Zoom API on http://localhost:${PORT} (explanations: ${kateEnabled() ? "claude" : "template"})`);
});
