/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCompanyApplications } from 'app/features/applications/hooks/use-company-applications';
import { Application } from 'app/features/applications/types/application';
import jwtStorageService from 'app/features/auth/jwt-storage-service';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';

type EditorType = {
  url?: string;
  is_url_file?: boolean;
  name?: string;
  app?: Application;
};

export const useEditors = (
  extension: string,
  options?: { preview_url?: string; editor_url?: string; editor_name?: string; url?: string },
) => {
  const workspaceId = useRouterWorkspace();
  const companyId = useRouterCompany();
  const { applications } = useCompanyApplications();
  const apps = applications.filter(
    app =>
      app.display?.tdrive?.files?.editor?.preview_url ||
      app.display?.tdrive?.files?.editor?.edition_url,
  );

  const preview_candidate: EditorType[] = [];
  const editor_candidate: EditorType[] = [];

  if (options?.preview_url) {
    preview_candidate.push({
      url: options?.preview_url,
    });
  }
  if (options?.editor_url) {
    editor_candidate.push({
      is_url_file: true,
      url: options?.editor_url,
      name: options?.editor_name || 'web link',
    });
  }

  //Primary exts
  apps.forEach(app => {
    if (
      (app.display?.tdrive?.files?.editor?.extensions || []).indexOf(
        ((extension || '') + (options?.url ? '.url' : '')).toLocaleLowerCase(),
      ) >= 0
    ) {
      if (app.display?.tdrive?.files?.editor?.edition_url) {
        editor_candidate.push({ app });
      }
      if (app.display?.tdrive?.files?.editor?.preview_url) {
        preview_candidate.push({
          url: app.display?.tdrive?.files?.editor?.preview_url,
          app: app,
        });
      }
    }
  });

  const openFile = (app: any, fileId: string, driveId: string) => {
    if (app.url && app.is_url_file) {
      window.open(app.url);
      return;
    }

    window.open(getFileUrl(app.display?.tdrive?.files?.editor?.edition_url, fileId, driveId));
  };

  const getPreviewUrl = (fileId: string): string => {
    return getFileUrl(preview_candidate?.[0]?.url as string, fileId);
  };

  const getFileUrl = (url: string, file_id: string, drive_id?: string): string => {
    const jwt = jwtStorageService.getJWT();

    if (!url) return '';

    return `${url}${
      url.indexOf('?') > 0 ? '&' : '?'
    }token=${jwt}&workspace_id=${workspaceId}&company_id=${companyId}&file_id=${file_id}${
      drive_id ? `&drive_file_id=${drive_id}` : ''
    }`;
  };

  return { candidates: editor_candidate, openFile, getPreviewUrl };
};
