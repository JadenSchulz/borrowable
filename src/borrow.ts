export class BorrowError extends Error {
  constructor(message: string, identifier: string, options?: ErrorOptions) {
    super(
      `An error occured while borrowing ${identifier}: ${message}`,
      options
    );
  }
}

export const registry = new FinalizationRegistry((heldValue) => {
  console.log("cleaning up....", heldValue);
});

export class Borrowable<T extends object> {
  #ref: WeakRef<T>;
  #id: string;

  constructor(obj: T, id: string = "no_id") {
    this.#ref = new WeakRef<T>(obj);
    this.#id = id;

    registry.register(obj, id);
  }

  isAlive() {
    return this.#ref.deref !== undefined;
  }

  borrow<R>(cont: (borrowed: T) => R): R {
    const borrowed = this.#ref.deref();

    if (!borrowed) {
      throw new BorrowError("Ref was GC'd", this.#id);
    }

    const value = cont(borrowed);

    if (Object.is(value, borrowed)) {
      throw new BorrowError("Borrow returned strong reference.", this.#id);
    }

    return value;
  }

  tryBorrow<R>(cont: (borrowed: T) => R): R | undefined {
    const borrowed = this.#ref.deref();

    if (!borrowed) return;

    const value = cont(borrowed);

    if (Object.is(value, borrowed)) {
      throw new BorrowError("Borrow returned strong reference.", this.#id);
    }

    return value;
  }
}
