import { describe, beforeEach, afterEach, it, expect, afterAll } from "@jest/globals";
import {deserialize} from "class-transformer";
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
import {DriveFileMockClass, DriveItemDetailsMockClass, SearchResultMockClass} from "../common/entities/mock_entities";

describe("the Drive feature", () => {
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

  const createItemFromFile = async (file: File): Promise<DriveFileMockClass> => {
    await TestDbService.getInstance(platform, true);

    const item = {
      name: file.metadata.name,
      parent_id: "root",
      company_id: file.company_id,
    };

    const version = {
      file_metadata: {
        name: file.metadata.name,
        size: file.upload_data?.size,
        thumbnails: [],
        external_id: file.id
      }
    }

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

    expect(result.item.id).toEqual("root");
    expect(result.item.name).toEqual("Home");

    done?.();
  });

  it("did fetch the trash", async done => {
    await TestDbService.getInstance(platform, true);

    const response = await e2e_getDocument(platform, "trash");
    const result = deserialize<DriveItemDetailsMockClass>(DriveItemDetailsMockClass, response.body);

    expect(result.item.id).toEqual("trash");
    expect(result.item.name).toEqual("Trash");

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

    expect(listTrashResult.item.name).toEqual("Trash");
    expect(listTrashResult.children.some(({ id }) => id === createItemResult.id)).toBeTruthy();

    done?.();
  });

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

  it("did search by mime type", async done => {
    // given:: all the sample files uploaded and documents for them created
    await Promise.all((await currentUser.uploadFiles()).map(f => currentUser.createDocumentFromFile(f)))

    const filters = {
      mime_type: "application/pdf",
    };

    jest.setTimeout(10000);
    await new Promise(r => setTimeout(r, 3000));


    let documents = await currentUser.searchDocument(filters);
    expect(documents.entities).toHaveLength(1);

    const actualFile = documents.entities[0];
    expect(actualFile.name).toEqual("sample.pdf");

    done?.();
  });

  it("did search by last modified", async done => {
    jest.setTimeout(100000000);
    const user = await TestHelpers.getInstance(platform, true);
    // given:: all the sample files uploaded and documents for them created
    const start = new Date().getTime();
    await user.uploadAllFilesOneByOne()
    const end = new Date().getTime();
    await user.uploadAllFilesOneByOne()
    //wait for putting docs to elastic and its indexing
    await new Promise(r => setTimeout(r, 3000));

    //then:: all the files are searchable without filters
    let documents = await user.searchDocument({});
    expect(documents.entities).toHaveLength(TestHelpers.ALL_FILES.length * 2);

    //then:: only file uploaded in the [start, end] interval are shown in the search results
    const filters = {
      last_modified_gt: start.toString(),
      last_modified_lt: end.toString()
    };
    documents = await user.searchDocument(filters);
    expect(documents.entities).toHaveLength(TestHelpers.ALL_FILES.length);

    done?.();
  });

  it("did search a file shared by another user", async done => {
    jest.setTimeout(30000);
    //given:
    const oneUser = await TestHelpers.getInstance(platform, true);
    const anotherUser = await TestHelpers.getInstance(platform, true);
    //upload files
    let files = await oneUser.uploadAllFilesOneByOne()

    await new Promise(r => setTimeout(r, 5000));

    //then:: files are not searchable for user without permissions
    expect((await anotherUser.searchDocument({})).entities).toHaveLength(0);

    //and searchable for user that have
    expect((await oneUser.searchDocument({})).entities).toHaveLength(TestHelpers.ALL_FILES.length);

    //give permissions to the file
    files[0].access_info.entities.push({
      type: "user",
      id: anotherUser.user.id,
      level: "read"
    })
    await oneUser.updateDocument(files[0].id, files[0]);
    await new Promise(r => setTimeout(r, 3000));

    //then file become searchable
    expect((await anotherUser.searchDocument({})).entities).toHaveLength(1);

    done?.();
  });

  it("did search a file by file owner", async done => {
    jest.setTimeout(30000);
    //given:
    const oneUser = await TestHelpers.getInstance(platform, true);
    const anotherUser = await TestHelpers.getInstance(platform, true);
    //upload files
    let files = await oneUser.uploadAllFilesOneByOne()
    await anotherUser.uploadAllFilesOneByOne()
    //give permissions for all files to 'another user'
    await Promise.all(files.map(f => {
      f.access_info.entities.push({
        type: "user",
        id: anotherUser.user.id,
        level: "read"
      })
      return oneUser.updateDocument(f.id, f);
    }));

    await new Promise(r => setTimeout(r, 5000));

    //then:: all files are searchable for 'another user'
    expect((await anotherUser.searchDocument({})).entities).toHaveLength(TestHelpers.ALL_FILES.length * 2);

    //and searchable for user that have
    expect((await oneUser.searchDocument({
      creator: oneUser.user.id,
    })).entities).toHaveLength(TestHelpers.ALL_FILES.length);

    done?.();

  });

  it("did search by 'added' date", async done => {
    jest.setTimeout(10000);
    const user = await TestHelpers.getInstance(platform, true);
    // given:: all the sample files uploaded and documents for them created
    await user.uploadRandomFileAndCreateDocument();
    const start = new Date().getTime();
    await user.uploadAllFilesAndCreateDocuments()
    const end = new Date().getTime();
    await user.uploadRandomFileAndCreateDocument();
    //wait for putting docs to elastic and its indexing
    await new Promise(r => setTimeout(r, 3000));

    //then:: all the files are searchable without filters
    let documents = await user.searchDocument({});
    expect(documents.entities).toHaveLength(TestHelpers.ALL_FILES.length + 2);

    //then:: only file uploaded in the [start, end] interval are shown in the search results
    const filters = {
      added_gt: start.toString(),
      added_lt: end.toString()
    };
    documents = await user.searchDocument(filters);
    expect(documents.entities).toHaveLength(TestHelpers.ALL_FILES.length);

    done?.();
  });

  it("did search order by name", async done => {
    jest.setTimeout(10000);
    const user = await TestHelpers.getInstance(platform, true);
    // given:: all the sample files uploaded and documents for them created
    await user.uploadAllFilesAndCreateDocuments()
    //wait for putting docs to elastic and its indexing
    await new Promise(r => setTimeout(r, 5000));

    //when:: sort files by name is ascending order
    const options = {
      sort: {
        name: "asc",
      }
    };
    const documents = await user.searchDocument(options);

    //then all the files are sorted properly by name
    expect(documents.entities.map(e => e.name)).toEqual(TestHelpers.ALL_FILES.sort());
    done?.();
  });

  it("did search order by name desc", async done => {
    jest.setTimeout(10000);
    const user = await TestHelpers.getInstance(platform, true);
    // given:: all the sample files uploaded and documents for them created
    await user.uploadAllFilesOneByOne()
    //wait for putting docs to elastic and its indexing
    await new Promise(r => setTimeout(r, 5000));

    //when:: sort files by name is ascending order
    const options = {
      sort: {
        name: "desc",
      }
    };
    const documents = await user.searchDocument(options);

    //then all the files are sorted properly by name
    expect(documents.entities.map(e => e.name)).toEqual(TestHelpers.ALL_FILES.sort().reverse());
    done?.();
  });

  it("did search order by added date", async done => {
    jest.setTimeout(10000);
    const user = await TestHelpers.getInstance(platform, true);
    // given:: all the sample files uploaded and documents for them created
    await user.uploadAllFilesOneByOne();
    //wait for putting docs to elastic and its indexing
    await new Promise(r => setTimeout(r, 5000));

    //when:: ask to sort files by the 'added' field
    const options = {
      sort: {
        added: "asc",
      }
    };
    const documents = await user.searchDocument(options);

    //then:: files should be sorted properly
    expect(documents.entities.map(e => e.name)).toEqual(TestHelpers.ALL_FILES);

    done?.();
  });

  it("did search order by added date desc", async done => {
    jest.setTimeout(10000);
    const user = await TestHelpers.getInstance(platform, true);
    // given:: all the sample files uploaded and documents for them created
    await user.uploadAllFilesOneByOne();
    //wait for putting docs to elastic and its indexing
    await new Promise(r => setTimeout(r, 5000));

    //when:: ask to sort files by the 'added' field desc
    const options = {
      sort: {
        added: "desc",
      }
    };
    const documents = await user.searchDocument(options);

    //then:: files should be sorted properly
    expect(documents.entities.map(e => e.name)).toEqual(TestHelpers.ALL_FILES.reverse());

    done?.();
  });



});
