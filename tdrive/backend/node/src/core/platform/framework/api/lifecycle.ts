import { TdriveContext } from "./context";

export interface Initializable {
  // TODO: Flag to tell if a service which fails to initialize must break all
  init?(context?: TdriveContext): Promise<this>;
}
