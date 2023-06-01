import { describe, beforeEach, afterEach, it, expect, afterAll } from "@jest/globals";
import { deserialize } from "class-transformer";
import { File } from "../../../src/services/files/entities/file";
import { ResourceUpdateResponse } from "../../../src/utils/types";
import { init, TestPlatform } from "../setup";
import { TestDbService } from "../utils.prepare.db";
import {
  e2e_createDocument,
  e2e_createDocumentFile,
  e2e_createVersion,
  e2e_deleteDocument,
  e2e_getDocument,
  e2e_searchDocument,
  e2e_updateDocument,
} from "./utils";

describe("the My Drive feature", () => {
  let platform: TestPlatform;

  class DriveFileMockClass {
    id: string;
    name: string;
    size: number;
    added: string;
    parent_id: string;
  }

  class DriveItemDetailsMockClass {
    path: string[];
    item: DriveFileMockClass;
    children: DriveFileMockClass[];
    versions: Record<string, unknown>[];
  }

  class SearchResultMockClass {
    entities: DriveFileMockClass[];
  }

  beforeEach(async () => {
    platform = await init({
      services: [
        "webserver",
        "database",
        "applications",
        "search",
        "storage",
        "message-queue",
        "user",
        "search",
        "files",
        "websocket",
        "messages",
        "auth",
        "realtime",
        "channels",
        "counter",
        "statistics",
        "platform-services",
        "documents",
      ],
    });
  });

  afterEach(async () => {
    await platform.tearDown();
  });

  afterAll(async () => {
    await platform.app.close();
  });

  const createItem = async (): Promise<DriveFileMockClass> => {
    await TestDbService.getInstance(platform, true);

    const item = {
      name: "new test file",
      parent_id: "user_" + platform.currentUser.id,
      company_id: platform.workspace.company_id,
    };

    const version = {};

    const response = await e2e_createDocument(platform, item, version);
    return deserialize<DriveFileMockClass>(DriveFileMockClass, response.body);
  };

  it("did create the drive item in my user folder", async done => {
    const result = await createItem();

    expect(result).toBeDefined();
    expect(result.name).toEqual("new test file");
    expect(result.added).toBeDefined();

    done?.();
  });

  it("did move an item to root and back", async done => {
    const createItemResult = await createItem();

    expect(createItemResult.id).toBeDefined();

    let updateItemResponse = await e2e_updateDocument(platform, createItemResult.id, {
      parent_id: "root",
    });
    let updateItemResult = deserialize<DriveFileMockClass>(
      DriveFileMockClass,
      updateItemResponse.body,
    );

    expect(createItemResult.id).toEqual(updateItemResult.id);
    expect(updateItemResult.parent_id).toEqual("root");

    updateItemResponse = await e2e_updateDocument(platform, createItemResult.id, {
      parent_id: "user_" + platform.currentUser.id,
    });
    updateItemResult = deserialize<DriveFileMockClass>(DriveFileMockClass, updateItemResponse.body);

    expect(createItemResult.id).toEqual(updateItemResult.id);
    expect(updateItemResult.parent_id).toEqual("user_" + platform.currentUser.id);

    done?.();
  });

  it("can't move an item to another user folder", async done => {
    const createItemResult = await createItem();

    expect(createItemResult.id).toBeDefined();

    let updateItemResponse = await e2e_updateDocument(platform, createItemResult.id, {
      parent_id: "user_2123",
    });

    expect(updateItemResponse.statusCode).not.toBe(200);

    done?.();
  });
});
