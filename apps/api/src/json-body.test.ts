import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import type { AddressInfo } from "node:net";
import { request } from "node:http";
import { jsonBody, MAX_BODY_BYTES } from "./json-body.js";

async function withServer(fn: (port: number) => Promise<void>) {
  const app = express();
  app.use(jsonBody);
  app.post("/echo", (req, res) => res.json({ body: req.body ?? null }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  try {
    await fn((server.address() as AddressInfo).port);
  } finally {
    server.close();
  }
}

/** Raw HTTP so we can send bodies without a Content-Length (chunked). */
function post(port: number, body: string, type = "application/json", chunked = false): Promise<{ status: number; json: unknown }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = { "Content-Type": type };
    if (!chunked) headers["Content-Length"] = String(Buffer.byteLength(body));
    const req = request({ host: "127.0.0.1", port, path: "/echo", method: "POST", headers }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, json: data ? JSON.parse(data) : null }));
    });
    req.on("error", reject);
    if (chunked) {
      for (let i = 0; i < body.length; i += 1024) req.write(body.slice(i, i + 1024));
    } else req.write(body);
    req.end();
  });
}

test("json body: valid object is parsed", () =>
  withServer(async (port) => {
    const r = await post(port, '{"a":1}');
    assert.equal(r.status, 200);
    assert.deepEqual(r.json, { body: { a: 1 } });
  }));

test("json body: malformed and non-object JSON are rejected with 400", () =>
  withServer(async (port) => {
    assert.equal((await post(port, "{bad")).status, 400);
    assert.equal((await post(port, '"just a string"')).status, 400);
    assert.equal((await post(port, "42")).status, 400);
  }));

test("json body: over the limit is 413, also without Content-Length (chunked)", () =>
  withServer(async (port) => {
    const big = JSON.stringify({ x: "a".repeat(MAX_BODY_BYTES) });
    assert.equal((await post(port, big)).status, 413);
    assert.equal((await post(port, big, "application/json", true)).status, 413);
  }));

test("json body: other content types are not parsed", () =>
  withServer(async (port) => {
    const r = await post(port, "a=1", "application/x-www-form-urlencoded");
    assert.equal(r.status, 200);
    assert.deepEqual(r.json, { body: null });
  }));

test("body-parser stand-in: express.json() fails loudly, raw-body is not installed", async () => {
  assert.throws(() => express.json(), /disabled in this project/);
  await assert.rejects(import("raw-body" as string), /Cannot find/);
});
