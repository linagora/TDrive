import { validate as validateUuid } from "uuid";
import { ChannelVisibility } from "../types";

export function checkCompanyAndWorkspaceForUser(
  companyId: string,
  workspaceId: string,
): Promise<boolean> {
  return Promise.resolve(
    validateUuid(companyId) &&
      (validateUuid(workspaceId) || workspaceId === ChannelVisibility.DIRECT),
  );
}
