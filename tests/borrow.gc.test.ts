import { describe, test, expect } from "vitest";
import { Borrowable, BorrowError } from "../src/borrow";
function gcPressurizer() {
  let { promise, resolve } = Promise.withResolvers<Borrowable<object>>();

  const reg = new FinalizationRegistry((borrowable: Borrowable<object>) => {
    resolve(borrowable);
  });

  (function createPressure(size: number, iteration: number) {
    let mem: any = new ArrayBuffer(2 ** 31);
    let borrowable = new Borrowable(mem);

    reg.register(mem, borrowable);
    mem = undefined;
    globalThis.gc?.();
    setImmediate(() => createPressure(size, iteration + 1));
  })(50000, 0);

  return promise;
}

const gcExposed = typeof globalThis.gc === "function";
describe.skipIf(!gcExposed)(
  "BorrowedRef --gc",
  () => {
    test("gc is exposed", ({ expect }) =>
      expect(globalThis.gc).not.toBe(undefined));

    test("borrow throws if object is GC'd", async () => {
      const borrowable = await gcPressurizer();
      expect(() => borrowable.borrow(() => {})).toThrow(BorrowError);
    });

    test("tryBorrow returns undefined if object is GC'd", async () => {
      const borrowable = await gcPressurizer();
      expect(borrowable.tryBorrow(() => {})).toBe(undefined);
    });
  },
  1_000_000
);
