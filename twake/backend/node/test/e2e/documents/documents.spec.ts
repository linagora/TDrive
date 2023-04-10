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

describe("the Drive feature", () => {
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
      parent_id: "root",
      company_id: platform.workspace.company_id,
    };

    const version = {};

    const response = await e2e_createDocument(platform, item, version);
    return deserialize<DriveFileMockClass>(DriveFileMockClass, response.body);
  };

  it("did create the drive item", async done => {
    const result = await createItem();

    expect(result).toBeDefined();
    expect(result.name).toEqual("new test file");
    expect(result.added).toBeDefined();

    done?.();
  });

  it("did fetch the drive item", async done => {
    await TestDbService.getInstance(platform, true);

    const response = await e2e_getDocument(platform, "");
    const result = deserialize<DriveItemDetailsMockClass>(DriveItemDetailsMockClass, response.body);

    expect(result.item.name).toEqual("root");

    done?.();
  });

  it("did fetch the trash", async done => {
    await TestDbService.getInstance(platform, true);

    const response = await e2e_getDocument(platform, "trash");
    const result = deserialize<DriveItemDetailsMockClass>(DriveItemDetailsMockClass, response.body);

    expect(result.item.name).toEqual("trash");

    done?.();
  });

  it("did delete an item", async done => {
    const createItemResult = await createItem();

    expect(createItemResult.id).toBeDefined();

    const deleteResponse = await e2e_deleteDocument(platform, createItemResult.id);
    expect(deleteResponse.statusCode).toEqual(200);

    done?.();
  });

  it("did update an item", async done => {
    const createItemResult = await createItem();

    expect(createItemResult.id).toBeDefined();

    const update = {
      name: "somethingelse",
    };

    const updateItemResponse = await e2e_updateDocument(platform, createItemResult.id, update);
    const updateItemResult = deserialize<DriveFileMockClass>(
      DriveFileMockClass,
      updateItemResponse.body,
    );

    expect(createItemResult.id).toEqual(updateItemResult.id);
    expect(updateItemResult.name).toEqual("somethingelse");

    done?.();
  });

  it("did move an item to trash", async done => {
    const createItemResult = await createItem();

    expect(createItemResult.id).toBeDefined();

    const moveToTrashResponse = await e2e_deleteDocument(platform, createItemResult.id);
    expect(moveToTrashResponse.statusCode).toEqual(200);

    const listTrashResponse = await e2e_getDocument(platform, "trash");
    const listTrashResult = deserialize<DriveItemDetailsMockClass>(
      DriveItemDetailsMockClass,
      listTrashResponse.body,
    );

    expect(listTrashResult.item.name).toEqual("trash");
    expect(listTrashResult.children.some(({ id }) => id === createItemResult.id)).toBeTruthy();

    done?.();
  });

  // TODO: wait for elastic search index
  it("did search for an item", async done => {
    const createItemResult = await createItem();

    expect(createItemResult.id).toBeDefined();

    await e2e_getDocument(platform, "root");
    await e2e_getDocument(platform, createItemResult.id);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const searchPayload = {
      search: "test",
    };

    const searchResponse = await e2e_searchDocument(platform, searchPayload);
    const searchResult = deserialize<SearchResultMockClass>(
      SearchResultMockClass,
      searchResponse.body,
    );

    expect(searchResult.entities.length).toBeGreaterThanOrEqual(1);

    done?.();
  });

  it("did search for an item that doesn't exist", async done => {
    await createItem();

    const unexistingSeachPayload = {
      search: "somethingthatdoesn'tandshouldn'texist",
    };
    const failSearchResponse = await e2e_searchDocument(platform, unexistingSeachPayload);
    const failSearchResult = deserialize<SearchResultMockClass>(
      SearchResultMockClass,
      failSearchResponse.body,
    );

    expect(failSearchResult.entities).toHaveLength(0);

    done?.();
  });

  it("did create a version for a drive item", async done => {
    const item = await createItem();
    const fileUploadResponse = await e2e_createDocumentFile(platform);
    const fileUploadResult = deserialize<ResourceUpdateResponse<File>>(
      ResourceUpdateResponse,
      fileUploadResponse.body,
    );

    const file_metadata = { external_id: fileUploadResult.resource.id };

    await e2e_createVersion(platform, item.id, { filename: "file2", file_metadata });
    await e2e_createVersion(platform, item.id, { filename: "file3", file_metadata });
    await e2e_createVersion(platform, item.id, { filename: "file4", file_metadata });

    const fetchItemResponse = await e2e_getDocument(platform, item.id);
    const fetchItemResult = deserialize<DriveItemDetailsMockClass>(
      DriveItemDetailsMockClass,
      fetchItemResponse.body,
    );

    expect(fetchItemResult.versions).toHaveLength(4);

    done?.();
  });
});
