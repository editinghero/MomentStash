const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/server/stubs');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const modules = ['stream', 'events', 'buffer', 'util', 'querystring', 'url', 'path', 'zlib', 'crypto', 'assert', 'process'];

for (const mod of modules) {
  const code = `import * as mod from "node:${mod}";\nexport default mod;\n`;
  fs.writeFileSync(path.join(dir, `${mod}-shim.ts`), code);
}
console.log('Shims generated.');
