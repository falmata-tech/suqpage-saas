import assert from "node:assert/strict";
import { googleAuthCallbackOrigin } from "../lib/auth-callback-origin";

const development = {
  NODE_ENV: "development",
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
};

assert.equal(googleAuthCallbackOrigin("localhost:3000", development), "http://localhost:3000");
assert.equal(googleAuthCallbackOrigin("127.0.0.1:3000", development), "http://127.0.0.1:3000");
assert.equal(googleAuthCallbackOrigin("localhost:3001", development), "http://127.0.0.1:3000");
assert.equal(googleAuthCallbackOrigin("example.com", development), "http://127.0.0.1:3000");
assert.equal(
  googleAuthCallbackOrigin("attacker.example", { ...development, NODE_ENV: "production" }),
  "http://127.0.0.1:3000",
);

console.log("Google Auth callback-origin contracts passed.");
