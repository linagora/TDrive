import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import {
  fromMongoDbOrderable,
  toMongoDbOrderable,
} from "../../../../../../src/core/platform/services/database/services/orm/utils";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import _ from "lodash";
import { v1 as uuidv1 } from "uuid";

describe("The MongoDb to Orderable module", () => {
  describe("The to/from orderable function", () => {
    it("should be unique", () => {
      const uuid1 = toMongoDbOrderable(uuidv1());
      const uuid2 = toMongoDbOrderable(uuidv1());
      const uuid3 = toMongoDbOrderable(uuidv1());
      const uuid4 = toMongoDbOrderable(uuidv1());

      expect(_.uniq([uuid1, uuid2, uuid3, uuid4]).length).toBe(4);
    });

    it("should convert both ways", () => {
      const uuid = uuidv1();
      const orderable = toMongoDbOrderable(uuid);

      expect(fromMongoDbOrderable(orderable)).toBe(uuid);
      expect(orderable).toBe(toMongoDbOrderable(fromMongoDbOrderable(orderable)));
    });
  });
});
