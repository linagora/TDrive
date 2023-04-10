import { afterAll, afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { deserialize } from "class-transformer";
import { AccessInformation } from "../../../src/services/documents/entities/drive-file";
import { init, TestPlatform } from "../setup";
import { TestDbService } from "../utils.prepare.db";
import { e2e_createDocument, e2e_getDocument } from "./utils";

const url = "/internal/services/documents/v1";

describe("the Drive Twake tabs feature", () => {
  let platform: TestPlatform;

  class DriveFileMockClass {
    id: string;
    name: string;
    size: number;
    added: string;
    parent_id: string;
    access_info: AccessInformation;
  }

  class DriveItemDetailsMockClass {
    path: string[];
    item: DriveFileMockClass;
    children: DriveFileMockClass[];
    versions: Record<string, unknown>[];
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

  it("did create a tab configuration on Drive side", async done => {
    await TestDbService.getInstance(platform, true);

    const item = {
      name: "new tab test file",
      parent_id: "root",
      company_id: platform.workspace.company_id,
    };

    const version = {};

    const response = await e2e_createDocument(platform, item, version);
    const doc = deserialize<DriveFileMockClass>(DriveFileMockClass, response.body);

    const tab = {
      company_id: platform.workspace.company_id,
      tab_id: "1234567890",
      channel_id: "abcdefghij",
      item_id: doc.id,
      level: "write",
    };

    const token = await platform.auth.getJWTToken();

    const createdTab = await platform.app.inject({
      method: "POST",
      url: `${url}/companies/${platform.workspace.company_id}/tabs/${tab.tab_id}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: tab,
    });

    expect(createdTab.statusCode).toBe(200);
    expect(createdTab.body).toBeDefined();
    expect(createdTab.json().company_id).toBe(tab.company_id);
    expect(createdTab.json().tab_id).toBe(tab.tab_id);
    expect(createdTab.json().item_id).toBe(tab.item_id);

    const getTabResponse = await platform.app.inject({
      method: "GET",
      url: `${url}/companies/${platform.workspace.company_id}/tabs/${tab.tab_id}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(getTabResponse.statusCode).toBe(200);
    expect(getTabResponse.body).toBeDefined();
    expect(getTabResponse.json().company_id).toBe(tab.company_id);
    expect(getTabResponse.json().tab_id).toBe(tab.tab_id);
    expect(getTabResponse.json().item_id).toBe(tab.item_id);

    const documentResponse = await e2e_getDocument(platform, doc.id);
    const documentResult = deserialize<DriveItemDetailsMockClass>(
      DriveItemDetailsMockClass,
      documentResponse.body,
    );

    console.log(documentResult?.item);

    expect(
      documentResult?.item?.access_info?.entities?.find(
        a => a?.type === "channel" && a.id === "abcdefghij" && a.level === "write",
      ),
    ).toBeDefined();

    done?.();
  });

  it("did refuse to create a tab configuration for an item I can't manage", async done => {
    const dbService = await TestDbService.getInstance(platform, true);
    const ws0pk = {
      id: platform.workspace.workspace_id,
      company_id: platform.workspace.company_id,
    };
    const otherUser = await dbService.createUser([ws0pk]);

    const item = {
      name: "new tab test file",
      parent_id: "root",
      company_id: platform.workspace.company_id,
      access_info: {
        entities: [
          {
            type: "folder",
            id: "parent",
            level: "none",
          } as any,
        ],
      },
    };

    const version = {};

    const response = await e2e_createDocument(platform, item, version);
    const doc = deserialize<DriveFileMockClass>(DriveFileMockClass, response.body);

    const tab = {
      company_id: platform.workspace.company_id,
      tab_id: "1234567890",
      channel_id: "abcdefghij",
      item_id: doc.id,
      level: "read",
    };

    const token = await platform.auth.getJWTToken({ sub: otherUser.id });

    const createdTab = await platform.app.inject({
      method: "POST",
      url: `${url}/companies/${platform.workspace.company_id}/tabs/${tab.tab_id}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: tab,
    });

    expect(createdTab.statusCode).toBe(403);

    done?.();
  });
});
