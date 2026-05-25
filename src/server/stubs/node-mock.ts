// Generic mock for unsupported Node.js modules in Cloudflare Workers
export const existsSync = () => false;
export const readFileSync = () => { throw new Error("fs.readFileSync is not supported in Cloudflare Workers"); };
export const writeFile = () => {};
export const writeFileSync = () => {};
export const promises = {
  readFile: async () => { throw new Error("fs.promises.readFile is not supported in Cloudflare Workers"); },
  writeFile: async () => {},
};
export const spawn = () => { throw new Error("child_process.spawn is not supported in Cloudflare Workers"); };
export const exec = () => { throw new Error("child_process.exec is not supported in Cloudflare Workers"); };
export const execSync = () => { throw new Error("child_process.execSync is not supported in Cloudflare Workers"); };
export const connect = () => { throw new Error("net/tls.connect is not supported in Cloudflare Workers"); };
export const Server = function() {};
export const createServer = () => {};
export const type = () => "CloudflareWorker";
export const arch = () => "v8";
export const platform = () => "browser";
export const release = () => ({ name: "v8" });
export const cpus = () => [];
export const homedir = () => "/";
export const tmpdir = () => "/tmp";
export const networkInterfaces = () => ({});

const mock: any = new Proxy(() => mock, {
  get(target, prop) {
    if (prop === "existsSync") return existsSync;
    if (prop === "readFileSync") return readFileSync;
    if (prop === "writeFileSync") return writeFileSync;
    if (prop === "promises") return promises;
    if (prop === "spawn") return spawn;
    if (prop === "exec") return exec;
    if (prop === "execSync") return execSync;
    if (prop === "connect") return connect;
    if (prop === "type") return type;
    if (prop === "arch") return arch;
    if (prop === "platform") return platform;
    if (prop === "release") return release;
    if (prop === "cpus") return cpus;
    if (prop === "homedir") return homedir;
    if (prop === "tmpdir") return tmpdir;
    if (prop === "networkInterfaces") return networkInterfaces;
    return mock;
  }
});

export default mock;
