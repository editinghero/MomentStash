const processMock = {
  env: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextTick: (fn: any, ...args: any[]) =>
    Promise.resolve().then(() => fn(...args)),
  version: "v18.0.0",
  platform: "linux",
  stderr: undefined,
  stdout: undefined,
  cwd: () => "/",
  pid: 1,
  emitWarning: () => {},
};

(processMock as Record<string, unknown>).default = processMock;
export = processMock;
