import { Router } from "express";
import { z } from "zod";
import { redeemHandoff } from "../engine/handoff.js";

/**
 * Provider-facing endpoint (the partner's page calls this). The token is the
 * only credential: single-use, 10 minutes, carries only approved fields.
 * In production this is a server-to-server call with mutual TLS / signed JWT.
 */
export const handoff = Router();

handoff.post("/redeem", (req, res) => {
  const body = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{32}$/) }).safeParse(req.body);
  if (!body.success) {
    res.status(422).json({ error: "invalid_token" });
    return;
  }
  const h = redeemHandoff(body.data.token);
  if (!h) {
    res.status(410).json({ error: "expired_or_used" });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json({ provider: h.provider, purpose: h.purpose, fields: h.fields.map(({ key, label, value }) => ({ key, label, value })) });
});
