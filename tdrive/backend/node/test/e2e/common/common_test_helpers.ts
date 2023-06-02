// @ts-ignore
import fs from "fs";
import {ResourceUpdateResponse} from "../../../src/utils/types";
import {File} from "../../../src/services/files/entities/file";
import {deserialize} from "class-transformer";
import formAutoContent from "form-auto-content";
import {TestPlatform} from "../setup";

export default class TestHelpers {

    static readonly ALL_FILES = [
        "assets/sample.png",
        "assets/sample.gif",
        "assets/sample.pdf",
        "assets/sample.doc",
        "assets/sample.zip",
        "assets/sample.mp4",
    ]

    platform: TestPlatform;
    constructor(
        platform: TestPlatform,
    ) {
        this.platform = platform
    }

     async uploadAllFiles()  {
        return Promise.all(TestHelpers.ALL_FILES.map(this.uploadFile.bind(this)));
    }

    async uploadRandomFile() {
        return await this.uploadFile(TestHelpers.ALL_FILES[Math.floor((Math.random()*TestHelpers.ALL_FILES.length))])
    }

    async uploadFile(filename: string) {
        const fullPath = `${__dirname}/${filename}`
        const url = "/internal/services/files/v1";
        const form = formAutoContent({file: fs.createReadStream(fullPath)});
        form.headers["authorization"] = `Bearer ${await this.platform.auth.getJWTToken()}`;

        const filesUploadRaw = await this.platform.app.inject({
            method: "POST",
            url: `${url}/companies/${this.platform.workspace.company_id}/files?thumbnail_sync=1`,
            ...form,
        });

        const filesUpload: ResourceUpdateResponse<File> = deserialize(
            ResourceUpdateResponse,
            filesUploadRaw.body,
        );
        return filesUpload.resource;
    }

}

