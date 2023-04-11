export type PendingEmail = {
  workspace_id: string;
  channel_id: string;
  company_id: string;
  email: string;
};

export type AtomPendingEmailsKey = { companyId: string; workspaceId: string; channelId: string };

export type SavePendingEmailRequest = {
  resource: {
    workspace_id: string;
    channel_id: string;
    company_id: string;
    email: string;
  };
};

export type DeletePendingEmailResponse = { status: 'success' | 'error' };
