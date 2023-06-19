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
import TestHelpers from "../common/common_test_helpers";
import {
  DriveFileMockClass,
  DriveItemDetailsMockClass,
  SearchResultMockClass,
} from "../common/entities/mock_entities";

describe("The File Browser Window and API", () => {
  let platform: TestPlatform;
  let currentUser: TestHelpers;
  let dbService: TestDbService;

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
    currentUser = await TestHelpers.getInstance(platform);
    dbService = await TestDbService.getInstance(platform, true);

    console.log("EACH!!!")
  });

  afterAll(async () => {
    await platform?.tearDown();
    platform = null;
  });


  it("I should successfully upload filed to the 'Shared Drive'", async () => {
    const result = await currentUser.uploadAllFilesOneByOne();
    expect(result).toBeDefined();
    expect(result.entries()).toBeDefined();
    expect(result.entries()).toHaveLength(TestHelpers.ALL_FILES.length);
  });

});

