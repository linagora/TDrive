import "reflect-metadata";
import {describe, it} from "@jest/globals";
import { I18nService } from "../../../../../src/services/i18n";

describe("i18n service", () => {

  let subj: I18nService;

  beforeAll(async () => {
    subj = await (new I18nService()).init();
  });


  it("'Should translate \"Hello\" to FR", async () => {
    //given
    const msg = "hello";

    //expect
    expect(subj.translate(msg, "fr")).toEqual("Bonjour");
  });

  it("'Should translate \"Hello\" to RU", async () => {
    //given
    const msg = "hello";

    //expect
    expect(subj.translate(msg, "ru")).toEqual("Привет");
  });

});
