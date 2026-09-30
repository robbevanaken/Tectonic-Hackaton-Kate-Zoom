import type { NextFunction, Request, Response } from "express";

/** Hard cap on request bodies. A number, never parsed from a string. */
export const MAX_BODY_BYTES = 10 * 1024;

/**
 * Minimal, strict JSON body reader used instead of `express.json()`.
 *
 * Why: express.json() delegates to raw-body, which has a CVE where an invalid
 * `limit` silently disables the size check. Our limit was always valid, but
 * reading the body ourselves means that code path is never reachable here.
 *
 * - Only `application/json` bodies are read; anything else leaves req.body undefined.
 * - Counts bytes while streaming and stops at MAX_BODY_BYTES with 413.
 * - Only objects and arrays are accepted (strict JSON), otherwise 400.
 */
export function jsonBody(req: Request, res: Response, next: NextFunction): void {
  const type = (req.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
  if (req.method === "GET" || req.method === "HEAD" || type !== "application/json") {
    next();
    return;
  }
  const declared = Number(req.headers["content-length"] ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    res.status(413).json({ error: "payload_too_large" });
    req.resume();
    return;
  }

  const chunks: Buffer[] = [];
  let size = 0;
  let done = false;
  const finish = (fn: () => void) => {
    if (done) return;
    done = true;
    fn();
  };

  req.on("data", (chunk: Buffer) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      finish(() => res.status(413).json({ error: "payload_too_large" }));
      req.removeAllListeners("data");
      req.resume();
      return;
    }
    chunks.push(chunk);
  });
  req.on("end", () =>
    finish(() => {
      const text = Buffer.concat(chunks).toString("utf8");
      if (text.trim() === "") {
        req.body = {};
        next();
        return;
      }
      try {
        const parsed: unknown = JSON.parse(text);
        if (parsed === null || typeof parsed !== "object") {
          res.status(400).json({ error: "invalid_json" });
          return;
        }
        req.body = parsed;
        next();
      } catch {
        res.status(400).json({ error: "invalid_json" });
      }
    }),
  );
  req.on("error", () => finish(() => res.status(400).json({ error: "bad_request" })));
}
