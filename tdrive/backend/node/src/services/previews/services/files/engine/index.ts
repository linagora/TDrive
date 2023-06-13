import { Initializable } from "../../../../../core/platform/framework";
import { ClearProcessor } from "./clear";
import { PreviewProcessor } from "./service";
import gr from "../../../../global-resolver";

/**
 * The notification engine is in charge of processing data and delivering user notifications on the right place
 */
export class PreviewEngine implements Initializable {
  async init(): Promise<this> {
    gr.platformServices.messageQueue.processor.addHandler(new PreviewProcessor());
    gr.platformServices.messageQueue.processor.addHandler(new ClearProcessor());
    return this;
  }
}
