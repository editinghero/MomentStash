const processMock = {
  env: {},
  nextTick: (fn, ...args) => Promise.resolve().then(() => fn(...args)),
  version: 'v18.0.0',
  platform: 'linux',
  stderr: undefined,
  stdout: undefined,
  cwd: () => '/',
  pid: 1,
  emitWarning: () => {},
};

export = processMock;
