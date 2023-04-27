import "reflect-metadata";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { init, TestPlatform } from "../setup";
import { ResourceUpdateResponse } from "../../../src/utils/types";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fs from "fs";
import { File } from "../../../src/services/files/entities/file";
import { deserialize } from "class-transformer";
import formAutoContent from "form-auto-content";
import LocalConnectorService from "../../../src/core/platform/services/storage/connectors/local/service";


describe("The Files feature", () => {
  const url = "/internal/services/files/v1";
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await init({
      services: ["webserver", "database", "storage", "files", "previews"],
    });
    await platform.database.getConnector().init();
  });

  afterAll(async done => {
    await platform?.tearDown();
    platform = null;
    done();
  });

  async function uploadFile(file: string) {
    const form = formAutoContent({file: fs.createReadStream(file)});
    form.headers["authorization"] = `Bearer ${await platform.auth.getJWTToken()}`;

    const filesUploadRaw = await platform.app.inject({
      method: "POST",
      url: `${url}/companies/${platform.workspace.company_id}/files?thumbnail_sync=1`,
      ...form,
    });
    const filesUpload: ResourceUpdateResponse<File> = deserialize(
        ResourceUpdateResponse,
        filesUploadRaw.body,
    );
    return filesUpload;
  }

  describe("On user send files", () => {
    const files = [
      "assets/sample.png",
      "assets/sample.gif",
      "assets/sample.pdf",
      "assets/sample.doc",
      "assets/sample.zip",
      "assets/sample.mp4",
    ].map(p => `${__dirname}/${p}`);
    const thumbnails = [1, 1, 2, 5, 0, 1];

    it("Download file should return 500 if file doesn't exists", async () => {
      //given file
      const filesUpload = await uploadFile(files[0]);
      expect(filesUpload.resource.id).toBeTruthy();
      //clean files directory
      expect(platform.storage.getConnector()).toBeInstanceOf(LocalConnectorService)
      const path = (<LocalConnectorService>platform.storage.getConnector()).configuration.path;
      fs.readdirSync(path).forEach(f => fs.rmSync(`${path}/${f}`, {recursive: true, force: true}));
      //when try to download the file
      const fileDownloadResponse = await platform.app.inject({
        method: "GET",
        url: `${url}/companies/${platform.workspace.company_id}/files/${filesUpload.resource.id}/download`,
      });
      //then file should be not found with 404 error and "File not found message"
      expect(fileDownloadResponse).toBeTruthy();
      expect(fileDownloadResponse.statusCode).toBe(500);

    }, 120000);


    it.skip("should save file and generate previews", async done => {
      for (const i in files) {
        const file = files[i];

        const filesUpload = await uploadFile(file);

        expect(filesUpload.resource.id).not.toBeFalsy();
        expect(filesUpload.resource.encryption_key).toBeFalsy(); //This must not be disclosed
        expect(filesUpload.resource.thumbnails.length).toBe(thumbnails[i]);

        for (const thumb of filesUpload.resource.thumbnails) {
          const thumbnails = await platform.app.inject({
            headers: {"authorization": `Bearer ${await platform.auth.getJWTToken()}`},
            method: "GET",
            url: `${url}/companies/${platform.workspace.company_id}/files/${filesUpload.resource.id}/thumbnails/${thumb.index}`,
          });
          expect(thumbnails.statusCode).toBe(200);
        }
      }

      done();
    }, 1200000);
  });
});

