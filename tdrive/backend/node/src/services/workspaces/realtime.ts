import { WebsocketMetadata } from "../../utils/types";
import Workspace from "./entities/workspace";
import { WorkspaceExecutionContext } from "./types";

export function getWebsocketInformation(workspace: Workspace): WebsocketMetadata {
  return {
    name: workspace.name,
    room: getWorkspacePath(workspace),
  };
}

export function getWorkspaceRooms(context: WorkspaceExecutionContext): WebsocketMetadata[] {
  return [
    {
      name: "workspaces",
      room: getRoomName(context),
    },
  ];
}

export function getRoomName(context: Pick<Workspace, "company_id">): string {
  return `/companies/${context.company_id}/workspaces`;
}

export function getWorkspacePath(
  workspace: Pick<Workspace, "id">,
  context?: WorkspaceExecutionContext,
): string {
  return `/companies/${context?.company_id}/workspaces/${workspace.id}`;
}
