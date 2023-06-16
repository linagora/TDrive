import i18n from "i18n";
import path from "path";
import { logger } from "../../core/platform/framework/logger";
import { Initializable, TdriveServiceProvider } from "../../core/platform/framework";

export class I18nService implements TdriveServiceProvider, Initializable {
  version = "0";

  public translate(str: string, locale: string): string {
    return i18n.__({ phrase: str, locale: locale });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async init(): Promise<this> {
    i18n.configure({
      locales: ["en", "ru", "fr"],
      defaultLocale: "en",
      directory: path.resolve("./locales/"),
      logWarnFn: msg => logger.warn(msg),
      logErrorFn: msg => logger.error(msg),
    });
    return this;
  }
}
