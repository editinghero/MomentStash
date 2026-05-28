import { build } from "esbuild";
import { rmSync, unlinkSync } from "fs";

try {
  rmSync(".wrangler", { recursive: true, force: true });
} catch (e) {}

try {
  unlinkSync("dist/client/wrangler.json");
} catch (e) {}

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Modules NOT available natively in Cloudflare Workers — must mock
const mocks = {
  child_process: "./src/server/stubs/node-mock.ts",
  dns: "./src/server/stubs/node-mock.ts",
  fs: "./src/server/stubs/node-mock.ts",
  http: "./src/server/stubs/node-mock.ts",
  https: "./src/server/stubs/node-mock.ts",
  http2: "./src/server/stubs/node-mock.ts",
  net: "./src/server/stubs/node-mock.ts",
  os: "./src/server/stubs/node-mock.ts",
  process: "./src/server/stubs/process-mock.ts",
  readline: "./src/server/stubs/node-mock.ts",
  repl: "./src/server/stubs/node-mock.ts",
  tls: "./src/server/stubs/node-mock.ts",
  vm: "./src/server/stubs/node-mock.ts",
  async_hooks: "./src/server/stubs/async-hooks-mock.ts",
  gsap: "./src/server/stubs/gsap-mock.ts",
  "gsap/ScrollTrigger": "./src/server/stubs/gsap-mock.ts",
};

// These modules ARE available natively in Cloudflare Workers (nodejs_compat).
// When imported via bare specifier (e.g. require("stream")), redirect to node:xxx
// so they resolve to the native implementation.
const nativeModules = [
  "assert",
  "buffer",
  "crypto",
  "events",
  "path",
  "querystring",
  "stream",
  "stream/web",
  "url",
  "util",
  "zlib",
];

const resolvedMocks = Object.fromEntries(
  Object.entries(mocks).map(([k, v]) => [k, require("path").resolve(v)]),
);

const nodeMockPath = require("path").resolve("./src/server/stubs/node-mock.ts");
const processMockPath = require("path").resolve(
  "./src/server/stubs/process-mock.ts",
);

const bannerCode = `
import * as _assert from "node:assert";
import * as _buffer from "node:buffer";
import * as _crypto from "node:crypto";
import * as _events from "node:events";
import * as _path from "node:path";
import * as _querystring from "node:querystring";
import * as _stream from "node:stream";
import * as _streamWeb from "node:stream/web";
import * as _url from "node:url";
import * as _util from "node:util";
import * as _zlib from "node:zlib";
const _requireMap = {
  "assert": _assert,
  "node:assert": _assert,
  "buffer": _buffer,
  "node:buffer": _buffer,
  "crypto": _crypto,
  "node:crypto": _crypto,
  "events": _events,
  "node:events": _events,
  "path": _path,
  "node:path": _path,
  "querystring": _querystring,
  "node:querystring": _querystring,
  "stream": _stream,
  "node:stream": _stream,
  "stream/web": _streamWeb,
  "node:stream/web": _streamWeb,
  "url": _url,
  "node:url": _url,
  "util": _util,
  "node:util": _util,
  "zlib": _zlib,
  "node:zlib": _zlib,
};

globalThis.require = function(x) {
  if (x in _requireMap) return _requireMap[x];
  throw new Error("Dynamic require of " + x + " is not supported");
};

`;

build({
  entryPoints: ["src/entry-cloudflare.ts"],
  bundle: true,
  format: "esm",
  outfile: "dist/client/_worker.js",
  external: ["cloudflare:*"],
  platform: "neutral",
  mainFields: ["browser", "module", "main"],
  conditions: ["workerd", "worker", "browser"],
  plugins: [
    {
      name: "node-mocks",
      setup(build) {
        const mockNames = new Set(Object.keys(resolvedMocks));

        build.onResolve({ filter: /^node:.+/ }, (args) => {
          const name = args.path.slice(5);
          if (resolvedMocks[name]) {
            return { path: resolvedMocks[name] };
          }
          // Not in mocks → it's a natively-available module (e.g. node:stream, node:buffer)
          // Mark as external so Cloudflare Workers resolves it at runtime
          return { external: true };
        });

        // Bare specifier for natively-available modules → treat as external
        // to `node:*` path so Cloudflare Workers resolves it at runtime.
        // (e.g. "stream" → external "node:stream")
        const bareNative = nativeModules.map((m) => m.replace("/", "\\/"));
        build.onResolve(
          { filter: new RegExp(`^(${bareNative.join("|")})$`) },
          (args) => {
            return { external: true, path: `node:${args.path}` };
          },
        );

        // Bare specifier for mocked modules → forward to the mock directly
        // (e.g. bare "process", "fs" used by some bundled libraries)
        const bareMockNames = Object.keys(resolvedMocks).filter(
          (k) => !nativeModules.includes(k),
        );
        build.onResolve(
          { filter: new RegExp(`^(${bareMockNames.join("|")})$`) },
          (args) => {
            return { path: resolvedMocks[args.path] };
          },
        );

        build.onResolve({ filter: /^gsap(\/.*)?$/ }, (args) => {
          if (resolvedMocks[args.path]) {
            return { path: resolvedMocks[args.path] };
          }
          return { path: nodeMockPath };
        });
      },
    },
  ],
  minify: true,
  banner: {
    js: bannerCode,
  },
}).catch(() => process.exit(1));
