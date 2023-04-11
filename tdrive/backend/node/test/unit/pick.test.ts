import { describe, expect, it } from "@jest/globals";
import * as pickUtils from "../../src/utils/pick";

describe("The pick utils", () => {
  describe("The pick function", () => {
    it("should return an object wich contains only the defined properties", () => {
      class TestClass {
        keep: string;
        me: string;
        skip: string;
      }

      const keysToKeep = ["keep", "me"] as const;
      const object = { keep: "foo", me: "bar", skip: "baz" } as TestClass;
      const result = pickUtils.pick(object, ...keysToKeep);

      expect(result).toEqual({ keep: "foo", me: "bar" });
      expect(result).not.toContain("skip");
    });

    it("should return an empty object when input is empty", () => {
      class TestClass {
        keep: string;
        me: string;
        skip: string;
      }

      const keysToKeep = [] as const;
      const object = { keep: "foo", me: "bar", skip: "baz" } as TestClass;
      const result = pickUtils.pick(object, ...keysToKeep);

      expect(result).toEqual({});
    });
  });
});
