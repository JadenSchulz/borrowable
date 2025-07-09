import { Borrowable, BorrowError } from "../src/borrow/borrow";
import { beforeEach, describe, test } from "vitest";

describe("BorrowedRef", () => {
  let obj: object;
  let ref: Borrowable<object>;

  beforeEach(() => {
    obj = {};
    ref = new Borrowable(obj, "testObj");
  });

  test("borrow calls callback with object", ({ expect }) =>
    ref.borrow((o) => expect(o).toBe(obj)));

  test("borrow throws if callback returns strong ref", ({ expect }) =>
    expect(() => ref.borrow((o) => o)).toThrow(BorrowError));
});
