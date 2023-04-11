import { ExecutionContext } from "../../../core/platform/framework/api/crud-service";

export interface CompanyExecutionContext extends ExecutionContext {
  company: { id: string };
}
