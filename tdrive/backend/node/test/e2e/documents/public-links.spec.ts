import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { deserialize } from "class-transformer";
import { AccessInformation, DriveFile } from "../../../src/services/documents/entities/drive-file";
import { FileVersion } from "../../../src/services/documents/entities/file-version";
import { DriveFileAccessLevel, DriveItemDetails } from "../../../src/services/documents/types";
import { init, TestPlatform } from "../setup";
import { TestDbService } from "../utils.prepare.db";
import { e2e_createDocument, e2e_updateDocument } from "./utils";

const url = "/internal/services/documents/v1";

describe("the public links feature", () => {
  let platform: TestPlatform;

  class DriveFileMockClass {
    id: string;
    name: string;
    size: number;
    added: string;
    parent_id: string;
    company_id: string;
    access_info: AccessInformation;
  }

  class FullDriveInfoMockClass {
    path: DriveFile[];
    item?: DriveFile;
    versions?: FileVersion[];
    children: DriveFile[];
    access: DriveFileAccessLevel | "none";
  }

  beforeAll(async () => {
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

  afterAll(async () => {
    await platform.tearDown();
    await platform.app.close();
  });

  const createItem = async (): Promise<DriveFileMockClass> => {
    await TestDbService.getInstance(platform, true);

    const item = {
      name: "public file",
      parent_id: "root",
      company_id: platform.workspace.company_id,
    };

    const version = {};

    const response = await e2e_createDocument(platform, item, version);
    return deserialize<DriveFileMockClass>(DriveFileMockClass, response.body);
  };

  let publicFile: DriveFileMockClass;

  it("did create the drive item", async done => {
    const result = await createItem();
    publicFile = result;

    expect(result).toBeDefined();
    expect(result.name).toEqual("public file");
    expect(result.added).toBeDefined();
    expect(result.access_info).toBeDefined();

    done?.();
  });

  it("unable to access non public file", async done => {
    const res = await platform.app.inject({
      method: "GET",
      url: `${url}/companies/${publicFile.company_id}/item/${publicFile.id}?public_token=${publicFile.access_info.public?.token}`,
      headers: {},
    });

    expect(res.statusCode).toBe(401);

    done?.();
  });

  it("should access public file", async done => {
    const res = await e2e_updateDocument(platform, publicFile.id, {
      ...publicFile,
      access_info: {
        ...publicFile.access_info,
        public: {
          ...publicFile.access_info.public!,
          level: "read",
        },
      },
    });
    expect(res.statusCode).toBe(200);
    const file = deserialize<DriveFileMockClass>(DriveFileMockClass, res.body);
    expect(file.access_info.public?.level).toBe("read");

    const resPublicRaw = await platform.app.inject({
      method: "GET",
      url: `${url}/companies/${publicFile.company_id}/item/${publicFile.id}?public_token=${publicFile.access_info.public?.token}`,
      headers: {},
    });
    const resPublic = deserialize<DriveItemDetails>(FullDriveInfoMockClass, resPublicRaw.body);
    expect(resPublicRaw.statusCode).toBe(200);
    expect(resPublic.item?.id).toBe(publicFile.id);

    done?.();
  });

  it("unable to access expired public file link", async done => {
    await e2e_updateDocument(platform, publicFile.id, {
      ...publicFile,
      access_info: {
        ...publicFile.access_info,
        public: {
          ...publicFile.access_info.public!,
          level: "read",
          expiration: Date.now() + 1000 * 60, //In the future
        },
      },
    });

    let resPublicRaw = await platform.app.inject({
      method: "GET",
      url: `${url}/companies/${publicFile.company_id}/item/${publicFile.id}?public_token=${publicFile.access_info.public?.token}`,
      headers: {},
    });
    const resPublic = deserialize<DriveItemDetails>(FullDriveInfoMockClass, resPublicRaw.body);
    expect(resPublicRaw.statusCode).toBe(200);
    expect(resPublic.item?.id).toBe(publicFile.id);

    await e2e_updateDocument(platform, publicFile.id, {
      ...publicFile,
      access_info: {
        ...publicFile.access_info,
        public: {
          ...publicFile.access_info.public!,
          level: "read",
          expiration: 123, //In the past
        },
      },
    });

    resPublicRaw = await platform.app.inject({
      method: "GET",
      url: `${url}/companies/${publicFile.company_id}/item/${publicFile.id}?public_token=${publicFile.access_info.public?.token}`,
      headers: {},
    });
    expect(resPublicRaw.statusCode).toBe(401);

    await e2e_updateDocument(platform, publicFile.id, {
      ...publicFile,
      access_info: {
        ...publicFile.access_info,
        public: {
          ...publicFile.access_info.public!,
          level: "read",
          expiration: 0, //Reset to default
        },
      },
    });

    done?.();
  });

  it("access public file link with password", async done => {
    await e2e_updateDocument(platform, publicFile.id, {
      ...publicFile,
      access_info: {
        ...publicFile.access_info,
        public: {
          ...publicFile.access_info.public!,
          level: "read",
          password: "abcdef",
        },
      },
    });

    let resPublicRaw = await platform.app.inject({
      method: "GET",
      url: `${url}/companies/${publicFile.company_id}/item/${publicFile.id}?public_token=${
        publicFile.access_info.public?.token
      }%2B${"abcdef"}`,
      headers: {},
    });
    let resPublic = deserialize<DriveItemDetails>(FullDriveInfoMockClass, resPublicRaw.body);
    expect(resPublicRaw.statusCode).toBe(200);
    expect(resPublic.item?.id).toBe(publicFile.id);

    resPublicRaw = await platform.app.inject({
      method: "GET",
      url: `${url}/companies/${publicFile.company_id}/item/${publicFile.id}?public_token=${publicFile.access_info.public?.token}`,
      headers: {},
    });
    expect(resPublicRaw.statusCode).toBe(401);

    await e2e_updateDocument(platform, publicFile.id, {
      ...publicFile,
      access_info: {
        ...publicFile.access_info,
        public: {
          ...publicFile.access_info.public!,
          level: "read",
          password: "",
        },
      },
    });

    done?.();
  });
});
