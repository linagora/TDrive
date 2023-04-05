import { Initializable, TdriveServiceProvider } from "../../core/platform/framework";

export interface StatisticsAPI extends TdriveServiceProvider, Initializable {
  increase(companyId: string, eventName: string, value?: number): Promise<void>;
  get(companyId: string | null, eventName: string): Promise<number>;
}

export const STATISTICS_GLOBAL_KEY = "global";
