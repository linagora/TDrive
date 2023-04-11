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

describe.skip("The Files feature", () => {
  const url = "/internal/services/files/v1";
  let platform: TestPlatform;

  beforeAll(async () => {
    platform = await init({
      services: ["webserver", "database", "storage", "message-queue", "files", "previews"],
    });
  });

  afterAll(async done => {
    await platform?.tearDown();
    platform = null;
    done();
  });

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

    it("should save file and generate previews", async done => {
      for (const i in files) {
        const file = files[i];

        const form = formAutoContent({ file: fs.createReadStream(file) });
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

        expect(filesUpload.resource.id).not.toBeFalsy();
        expect(filesUpload.resource.encryption_key).toBeFalsy(); //This must not be disclosed
        expect(filesUpload.resource.thumbnails.length).toBe(thumbnails[i]);

        for (const thumb of filesUpload.resource.thumbnails) {
          const thumbnails = await platform.app.inject({
            method: "GET",
            url: `${url}/companies/${platform.workspace.company_id}/files/${filesUpload.resource.id}/thumbnails/${thumb.index}`,
          });
          expect(thumbnails.statusCode).toBe(200);
        }
      }

      done();
    }, 120000);
  });
});
