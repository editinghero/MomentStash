const createMock = () => {
  const mock = function () {};

  // Essential methods to prevent "undefined" crashes in common Node.js libraries
  mock.has = () => false;
  mock.get = () => undefined;
  mock.set = () => mock;
  mock.append = () => mock;
  mock.delete = () => mock;
  mock.on = () => mock;
  mock.emit = () => mock;
  mock.write = () => mock;
  mock.end = () => mock;

  return new Proxy(mock, {
    get: (_, prop) => {
      if (prop === "default") return mock;
      if (prop === "then" || prop === "__esModule") return undefined;
      
      // Recursively return a mock for any other property access
      // to ensure that something.property.method() never fails with "undefined"
      if (typeof prop === "string") {
        return mock; 
      }
      return undefined;
    },
  });
};

const mock = createMock();
export = mock;
