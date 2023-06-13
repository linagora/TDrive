// eslint-disable-next-line @typescript-eslint/no-var-requires
const unoconv = require("unoconv-promise");
import { cleanFiles } from "../../../../../utils/files";
import { logger } from "../../../../../core/platform/framework/logger";

export async function convertFromOffice(
  path: string,
  options: {
    numberOfPages?: number;
  },
): Promise<{ output: string; done: boolean }> {
  if (options.numberOfPages >= 1) {
    const outputPath = `${path}.pdf`;
    try {
      await unoconv.run({
        file: path,
        output: outputPath,
        export: `PageRange=1-${options.numberOfPages}`,
      });
    } catch (err) {
      logger.error(`unoconv cant process ${err}`);
      cleanFiles([outputPath]);
      throw Error("Can't convert file with unoconv");
    }
    return { output: outputPath, done: true };
  } else {
    logger.error("Unoconv can't processe, number of pages lower than 1");
  }
}
