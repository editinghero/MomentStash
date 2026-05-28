const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "../src/server/stubs");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const modules = [
  "stream",
  "events",
  "buffer",
  "util",
  "querystring",
  "url",
  "path",
  "zlib",
  "crypto",
  "assert",
  "process",
];

for (const mod of modules) {
  // We use import * as because some modules might not have a default export in Cloudflare's compat layer
  const code = `import * as mod from "node:${mod}";\nconst exportObj = mod.default || mod;\nexport = exportObj;\n`;
  fs.writeFileSync(path.join(dir, `${mod}-shim.ts`), code);
}
console.log("Shims generated.");
