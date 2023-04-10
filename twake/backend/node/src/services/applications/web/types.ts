import { ExecutionContext } from "../../../core/platform/framework/api/crud-service";

export interface CompanyExecutionContext extends ExecutionContext {
  company: { id: string };
}

export interface ApplicationEventRequestBody {
  company_id: string;
  workspace_id: string;
  connection_id: string;
  type: string;
  name?: string;
  content: any;
  data: any;
}
