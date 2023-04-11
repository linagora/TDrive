/* eslint-disable @typescript-eslint/no-explicit-any */
import A from '@atoms/link';
import { getChannel } from '@features/channels/hooks/use-channel';
import { UserType } from '@features/users/types/user';
import { useWorkspace } from '@features/workspaces/hooks/use-workspaces';
import UsersService from '@features/users/services/current-user-service';
import RouterServices from '@features/router/services/router-service';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useSearchModal } from 'app/features/search/hooks/use-search';

export default ({
  user,
  context,
}: {
  user?: UserType;
  context?: { channelId?: string; workspaceId?: string; companyId?: string };
}) => {
  const channel = getChannel(context?.channelId || '');

  const routerWorkspace = useRouterWorkspace();
  const routerCompany = useRouterCompany();
  const workspaceId =
    (context?.workspaceId !== 'direct' ? context?.workspaceId : '') || routerWorkspace;
  const { workspace } = useWorkspace(workspaceId || '');
  const companyId = context?.companyId || routerCompany;

  const { setOpen } = useSearchModal();

  const workspaceName =
    context?.workspaceId === 'direct' ? 'Direct' : workspace?.name ? workspace?.name : '';

  return (
    <div className="flex overflow-hidden whitespace-nowrap text-ellipsis">
      {!!user && <>{UsersService.getFullName(user)}</>}
      {!!user && !!(channel || workspaceName) && <span className="mx-2"> {'->'} </span>}
      {(channel || workspaceName) && (
        <>
          {!!workspaceName && <span className="opacity-50">{workspaceName}</span>}
          {!!workspaceName && !!channel?.name && <span className="mx-2"> / </span>}
          {!!channel?.name && (
            <A
              onClick={(e: any) => {
                e.stopPropagation();
                setOpen(false);
                RouterServices.push(
                  RouterServices.generateRouteFromState({
                    companyId: companyId || '',
                    workspaceId: workspaceId || '',
                    channelId: context?.channelId || '',
                  }),
                );
              }}
            >
              {channel?.name}
            </A>
          )}
        </>
      )}
    </div>
  );
};
