"use strict";

// Express only re-exports these helpers (express.json(), express.raw(), ...).
// Kate Zoom never uses them: request bodies are read by apps/api/src/json-body.ts.
// Replacing body-parser keeps raw-body (and its CVE) out of the dependency tree.
// Calling any helper fails loudly instead of silently parsing without limits.
function disabled(name) {
  return function () {
    throw new Error(
      "express." + name + "() is disabled in this project. Use the jsonBody middleware from apps/api/src/json-body.ts."
    );
  };
}

exports.json = disabled("json");
exports.raw = disabled("raw");
exports.text = disabled("text");
exports.urlencoded = disabled("urlencoded");
