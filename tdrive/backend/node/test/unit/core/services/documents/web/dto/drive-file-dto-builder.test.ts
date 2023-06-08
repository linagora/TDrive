import "reflect-metadata";
import { describe } from "@jest/globals";
import { mock } from 'jest-mock-extended';
import { DriveFileDTOBuilder } from "../../../../../../../src/services/documents/web/dto/drive-file-dto-builder";
import { ListResult } from "../../../../../../../src/core/platform/framework/api/crud-service";
import { DriveFile } from "../../../../../../../src/services/documents/entities/drive-file";
import { CompanyExecutionContext } from "../../../../../../../src/services/applications/web/types";
import { UserServiceImpl } from "../../../../../../../src/services/user/services/users/service";

describe("Drive File DTO Builder Test", () => {

  const subj = new DriveFileDTOBuilder();


  it("The dto object will contain selected fields with the data ", async () => {
    //given
    const fields = ["id", "name"];
    const file = newFile("file_id", "file_name");

    //when

    let transformedFiles = await subj.build(
      new ListResult<DriveFile>("drive_files", [file]),
      context,
      fields
    );

    //then
    expect(transformedFiles).toBeDefined();
    expect(transformedFiles.getEntities()?.length).toEqual(1);
    const actual = transformedFiles.getEntities()?.[0];
    expect(actual.id).toEqual("file_id");
    expect(actual.name).toEqual("file_name");
  });

  it("The dto object will contain only selected fields with data", async () => {
    //given
    const fields = ["id", "name"];
    const file = newFile("file_id", "file_name", "file_parent_id");

    //when

    let transformedFiles = await subj.build(
      new ListResult<DriveFile>("drive_files", [file]),
      context,
      fields
    );

    //then
    expect(transformedFiles).toBeDefined();
    expect(transformedFiles.getEntities()?.length).toEqual(1);
    const actual = transformedFiles.getEntities()?.[0];
    expect(Object.getOwnPropertyNames(actual).sort()).toEqual(fields.sort());
  });

  it("When there is no fields set then whole object should be copied", async () => {
    //given
    const file = newFile("file_id", "file_name", "file_parent_id");

    //when

    let transformedFiles = await subj.build(
      new ListResult<DriveFile>("drive_files", [file]),
      context
    );

    //then
    expect(transformedFiles).toBeDefined();
    expect(transformedFiles.getEntities()?.length).toEqual(1);
    const actual = transformedFiles.getEntities()?.[0];
    for (const prop in Object.getOwnPropertyNames(file)) {
      expect(actual[prop]).toEqual(file[prop]);
    }
  });

  it("When field contains unknown property it should be skipped", async () => {
    //given
    const file = newFile("file_id", "file_name");
    let fields = ["id", "name", "unknown_property"];

    //when
    let transformedFiles = await subj.build(
      new ListResult<DriveFile>("drive_files", [file]),
      context,
      fields
    );

    //then
    expect(transformedFiles).toBeDefined();
    expect(transformedFiles.getEntities()?.length).toEqual(1);
    const actual = transformedFiles.getEntities()?.[0];
    expect(Object.getOwnPropertyNames(actual).sort()).toEqual(["id", "name"]);
  });


  it("When 'created_by' field is asked it should be initialized by corresponding user", async () => {
    //given
    let file_creator = newUser();
    const file = newFile("file_id", "file_name", "parent_id", file_creator.id);
    let fields = ["id", "name", "created_by"];
    subj.usersService = mock<UserServiceImpl>();
    subj.usersService.list = jest.fn().mockReturnValue(new ListResult("users", [file_creator]));

    //when
    let transformedFiles = await subj.build(
      new ListResult<DriveFile>("drive_files", [file]),
      context,
      fields
    );

    //then
    expect(transformedFiles).toBeDefined();
    expect(transformedFiles.getEntities()?.length).toEqual(1);
    const actual = transformedFiles.getEntities()?.[0];
    expect(actual.created_by.first_name).toEqual(file_creator.first_name);
    expect(actual.created_by.last_name).toEqual(file_creator.last_name);
    expect(actual.created_by.id).toEqual(file_creator.id);
  });

  it("When 'shared_by' field is asked it should be initialized by corresponding user", async () => {
    //given
    let file_shared_by = newUser();
    const file = newFile("file_id", "file_name", "parent_id", null, file_shared_by.id);
    let fields = ["id", "name", "shared_by"];
    subj.usersService = mock<UserServiceImpl>();
    subj.usersService.list = jest.fn().mockReturnValue(new ListResult("users", [file_shared_by]));

    //when
    let transformedFiles = await subj.build(
      new ListResult<DriveFile>("drive_files", [file]),
      context,
      fields
    );

    //then
    expect(transformedFiles).toBeDefined();
    expect(transformedFiles.getEntities()?.length).toEqual(1);
    const actual = transformedFiles.getEntities()?.[0];
    expect(actual.shared_by.first_name).toEqual(file_shared_by.first_name);
    expect(actual.shared_by.last_name).toEqual(file_shared_by.last_name);
    expect(actual.shared_by.id).toEqual(file_shared_by.id);
  });

  const context = {
    company: { id: "company_id" },
    user: {id : "current_user_id"}
  } as CompanyExecutionContext;

  const newFile = (id, name, parent_id = "parent_id",
                   creator = "file_creator", shared_by_id = "file_shared_by") => {
    return{
      name: name,
      id: id,
      parent_id: parent_id,
      last_version_cache: {
        file_size: 100,
        mode: "mode_me",
      },
      access_info: {
        entities: [
          {
            type: "user",
            id: context.user.id,
            level: "read",
            grantor: shared_by_id,
          }
        ]
      },
      creator: creator,
    } as DriveFile;
  }

});

function newUser() {
  return {
    id: "user_id" + Math.random(),
    first_name: "user_name" + +Math.random(),
    last_name: "user_name" + +Math.random(),
  };
}