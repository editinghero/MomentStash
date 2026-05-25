class AsyncLocalStorage<T = unknown> {
  #store: T | undefined = undefined;

  run<S>(store: T, callback: (...args: unknown[]) => S, ...args: unknown[]): S {
    const prev = this.#store;
    this.#store = store;
    try {
      return callback(...args);
    } finally {
      this.#store = prev;
    }
  }

  getStore(): T | undefined {
    return this.#store;
  }

  disable() {
    this.#store = undefined;
  }

  exit<S>(callback: (...args: unknown[]) => S, ...args: unknown[]): S {
    return callback(...args);
  }
}

export { AsyncLocalStorage };
