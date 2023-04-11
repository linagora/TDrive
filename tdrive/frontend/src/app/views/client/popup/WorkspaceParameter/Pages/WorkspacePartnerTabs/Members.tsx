/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import Languages from 'app/features/global/services/languages-service';
import { Table, Row, Typography } from 'antd';
import AlertManager from 'app/features/global/services/alert-manager-service';
import EditIcon from '@material-ui/icons/MoreHorizOutlined';
import Menu from 'components/menus/menu.jsx';
import { ColumnsType } from 'antd/lib/table';
import UserService from 'app/features/users/services/current-user-service';
import workspacesUsers from 'app/features/workspace-members/services/workspace-members-service';
import workspaceUserRightsService from 'app/features/workspaces/services/workspace-user-rights-service';
import InitService from 'app/features/global/services/init-service';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import Api from 'app/features/global/framework/api-service';
import ConsoleService from 'app/features/console/services/console-service';
import WorkspaceService from 'app/deprecated/workspaces/workspaces.jsx';
import { delayRequest } from 'app/features/global/utils/managedSearchRequest';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import Icon from 'app/components/icon/icon';
import { WorkspaceUserType } from 'app/features/workspaces/types/workspace';
import { useSetUserList } from 'app/features/users/hooks/use-user-list';
import { useSearchUsers } from 'app/features/users/hooks/use-search-user-list';
import MemberGrade from './MemberGrade';

type ColumnObjectType = { [key: string]: any };

const { Link, Text, Title } = Typography;

export default ({ filter }: { filter: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ColumnObjectType[]>([]);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [serverSearchedData, setServerSearchedData] = useState<ColumnObjectType[]>([]);
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();

  const { search, result } = useSearchUsers({ scope: 'workspace' });

  const prefixRoute = '/internal/services/workspaces/v1';
  const workspaceUsersRoute = `${prefixRoute}/companies/${companyId}/workspaces/${workspaceId}/users`;

  const { set: setUserList } = useSetUserList('Members');
  const { xs, sm } = useBreakpoint();

  useEffect(() => {
    requestWorkspaceUsers();
  }, []);

  useEffect(() => {
    delayRequest('workspace_partners_search', async () => {
      await search(filter);
    });
  }, [filter]);

  const filteredData: WorkspaceUserType[] | null = filter
    ? (result
        .map(u => ({
          user: u,
          ...u,
          role: u.workspaces?.find(w => w.id === workspaceId)?.role,
          user_id: u.id || '',
          workspace_id: workspaceId || '',
        }))
        .slice(0, 50) as WorkspaceUserType[])
    : null;

  const requestWorkspaceUsers = async (pageToken?: string) => {
    try {
      setLoading(true);

      const res = (await Api.get(
        `${workspaceUsersRoute}?limit=25${pageToken ? `&page_token=${pageToken}` : ''}`,
      )) as { resources: WorkspaceUserType[]; next_page_token: string };
      setPageToken(res.next_page_token || null);
      if (res.resources) {
        setData(pageToken ? _.uniqBy([...data, ...res.resources], col => col.id) : res.resources);
        setUserList(
          res.resources.map(wsUser => ({
            ...wsUser.user,
            workspaces: [{ id: workspaceId, company_id: companyId }],
          })),
        );
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const updateData = (updater: (data: ColumnObjectType[]) => ColumnObjectType[]) => {
    setData(updater(data));
    setServerSearchedData(updater(serverSearchedData));
  };

  const updateWorkspaceUserRole = async (col: WorkspaceUserType & { company_id: string }) => {
    const workspaceUserRole = `${prefixRoute}/companies/${col.company_id}/workspaces/${col.workspace_id}/users/${col.user_id}`;

    setLoading(true);
    const res = await Api.post<unknown, { resource: unknown }>(workspaceUserRole, {
      resource: {
        role: col.role === 'moderator' ? 'member' : 'moderator',
      },
    });

    if (res.resource) {
      updateData(data =>
        data.map(d => (d.user_id === col.user_id ? (res.resource as ColumnObjectType) : d)),
      );
    }

    setLoading(false);
  };

  const deleteWorkspaceUser = (col: { [key: string]: any }) =>
    AlertManager.confirm(() => {
      const deleteWorkspaceUser = `${prefixRoute}/companies/${col.company_id}/workspaces/${col.workspace_id}/users/${col.user_id}`;

      setLoading(true);
      Api.delete(deleteWorkspaceUser, () => {
        updateData(data => data.filter(d => d.user_id !== col.user_id));
        setLoading(false);
      });
    });

  const leaveWorkspace = () => {
    workspacesUsers.leaveWorkspace();
  };

  const buildMenu = (col: WorkspaceUserType & { company_id: string }) => {
    const menu: (Record<string, string | (() => void)> | boolean)[] = [];

    if (
      workspaceUserRightsService.hasGroupPrivilege() &&
      InitService.server_infos?.configuration?.accounts.type === 'remote'
    ) {
      menu.push({
        type: 'menu',
        text: Languages.t('scenes.app.popup.workspaceparameter.edit_from_console', []),
        onClick: () =>
          window.open(
            ConsoleService.getCompanyUsersManagementUrl(WorkspaceService.currentGroupId),
            '_blank',
          ),
      });
    }

    if (col.user_id === UserService.getCurrentUserId()) {
      menu.push({
        type: 'menu',
        text: Languages.t('scenes.app.popup.workspaceparameter.pages.quit_workspace_menu'),
        className: 'error',
        onClick: () => {
          leaveWorkspace();
        },
      });
    } else if (workspaceUserRightsService.hasWorkspacePrivilege()) {
      menu.push(
        workspaceUserRightsService.hasWorkspacePrivilege() && {
          type: 'menu',
          text: col.role === 'moderator' ? 'Set to workspace member' : `Set to workspace moderator`,
          onClick: () => updateWorkspaceUserRole(col),
        },
      );
      menu.push({
        type: 'menu',
        text: Languages.t('scenes.app.popup.workspaceparameter.pages.withdraw_button'),
        className: 'error',
        onClick: () => deleteWorkspaceUser(col),
      });
    }

    return (
      <div className="action">
        {menu.length > 0 && (
          <Menu className="option_button" style={{ paddingTop: 8, paddingRight: 8 }} menu={menu}>
            <EditIcon className="m-icon-small" />
          </Menu>
        )}
      </div>
    );
  };

  const columns: ColumnsType<ColumnObjectType> = [
    {
      title: Languages.t('scenes.app.popup.workspaceparameter.pages.table_title'),
      dataIndex: 'name',
      render: (_text, col) => {
        const fullName = UserService.getFullName(col.user);
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className="user_image"
              style={{
                backgroundImage: `url(${UserService.getThumbnail(col.user)})`,
              }}
            />

            {fullName.length > 0 && <Text className="small-right-margin">{fullName}</Text>}

            {col.user.email && <Text type="secondary">{col.user.email}</Text>}
          </div>
        );
      },
    },
    {
      title: Languages.t(
        'scenes.app.popup.workspaceparameter.pages.workspace_partner_tabs.members.table.tags',
      ),
      dataIndex: 'tags',
      render: (_text, col) => (
        <Text type="secondary">
          <MemberGrade
            companyRole={UserService.getUserRole(col.user, companyId)}
            workspaceRole={col.role}
          />
        </Text>
      ),
    },
    {
      title: '',
      dataIndex: 'menu',
      width: 50,
      render: (_text, col) =>
        false &&
        workspaceUserRightsService.hasWorkspacePrivilege() &&
        buildMenu(col as WorkspaceUserType & { company_id: string }),
    },
  ];

  return (
    <>
      <div>
        {InitService.server_infos?.configuration?.accounts.type === 'remote' && (
          <Link
            style={{ float: 'right' }}
            href="#"
            onClick={() => {
              window.open(
                ConsoleService.getCompanyUsersManagementUrl(WorkspaceService.currentGroupId),
                '_blank',
              );
            }}
          >
            <Icon type="external-link-alt" className="m-icon-small" />{' '}
            {Languages.t(
              'views.client.popup.workspace_parameter.pages.workspace_members.link_to_console',
            )}
          </Link>
        )}

        <Title level={3}>
          {Languages.t('scenes.apps.parameters.workspace_sections.members.members')}
        </Title>

        <Table<ColumnObjectType>
          columns={columns}
          loading={loading}
          size="small"
          pagination={false}
          dataSource={filteredData ? filteredData : data}
          scroll={{ x: xs || sm ? true : undefined }}
        />
        {pageToken !== null && pageToken.length && (
          <Row justify="center" align="middle" className="small-y-margin">
            <Link onClick={() => requestWorkspaceUsers(pageToken)}>
              {Languages.t('components.searchpopup.load_more')}
            </Link>
          </Row>
        )}
      </div>
    </>
  );
};
