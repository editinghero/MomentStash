const mock = new Proxy(
  function() {}, // make it callable just in case
  {
    get: (_, prop) => {
      if (prop === "default") return mock;
      if (typeof prop === "string" && prop !== "then" && prop !== "__esModule") {
        return mock;
      }
      return undefined;
    },
  }
);
export = mock;
