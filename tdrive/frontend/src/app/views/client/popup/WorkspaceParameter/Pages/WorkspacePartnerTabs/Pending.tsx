import React, { useEffect, useState } from 'react';
import Languages from 'app/features/global/services/languages-service';
import { Divider, Table, Typography } from 'antd';
import Menu from 'components/menus/menu.jsx';
import EditIcon from '@material-ui/icons/MoreHorizOutlined';
import { ColumnsType } from 'antd/lib/table';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import AccessRightsService from 'app/features/workspace-members/services/workspace-members-access-rights-service';
import WorkspaceUserAPIClient from 'app/features/workspace-members/api/workspace-members-api-client';

type PendingEmailResourceType = {
  company_role: string;
  email: string;
  role: string;
};

type ColumnObjectType = { key: number } & PendingEmailResourceType;

export default (props: { filter: string }) => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const DEFAULT_PAGE_SIZE = 5;

  const [loading, setLoading] = useState<boolean>(false);
  const [data, _setData] = useState<ColumnObjectType[]>([]);
  const [filteredData, setFilteredData] = useState<ColumnObjectType[] | null>(null);

  const { xs, sm } = useBreakpoint();

  useEffect(() => {
    refreshPendingEmails();
  }, []);

  useEffect(() => {
    onSearch();
  }, [props.filter, data]);

  const refreshPendingEmails = async () => {
    try {
      setLoading(true);
      setData(await WorkspaceUserAPIClient.listPending(companyId, workspaceId));
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const deletePendingEmail = async (col: ColumnObjectType) => {
    setLoading(true);
    await WorkspaceUserAPIClient.cancelPending(companyId, workspaceId, col.email);
    refreshPendingEmails();
    setLoading(false);
  };

  const setData = (resources: PendingEmailResourceType[]) => {
    if (resources) {
      _setData(
        resources.map((o: PendingEmailResourceType, key: number) => ({ key: key + 1, ...o })),
      );
    }
  };

  const onSearch = () => {
    if (props.filter.length) {
      const filteredData = data.filter(col =>
        (col.email || '').toLocaleLowerCase().includes(props.filter.toLocaleLowerCase()),
      );
      setFilteredData(filteredData);
    } else {
      setFilteredData(null);
    }
  };

  const columns: ColumnsType<ColumnObjectType> = [
    {
      title: Languages.t('general.email'),
      dataIndex: 'email',
      width: 200,
    },

    {
      title: '',
      dataIndex: 'menu',
      width: 50,
      render: (_text, col) => {
        if (!AccessRightsService.hasLevel(workspaceId, 'member')) {
          return;
        }
        return (
          <div className="action">
            <Menu
              className="option_button"
              style={{ padding: 4 }}
              menu={[
                {
                  type: 'menu',
                  className: 'danger',
                  text: Languages.t('scenes.app.popup.workspaceparameter.pages.cancel_invitation'),
                  onClick: () => deletePendingEmail(col),
                },
              ]}
            >
              <EditIcon className="m-icon-small" />
            </Menu>
          </div>
        );
      },
    },
  ];

  if (data.length === 0) {
    return <></>;
  }

  return (
    <>
      <div>
        <Typography.Title level={3}>
          {Languages.t('scenes.apps.parameters.workspace_sections.members.pending')}
        </Typography.Title>
        <Table
          columns={columns}
          loading={loading}
          dataSource={filteredData ? filteredData : data}
          size="small"
          pagination={{ pageSize: DEFAULT_PAGE_SIZE, simple: true }}
          scroll={{ x: xs || sm ? true : undefined }}
        />
      </div>
      <Divider />
    </>
  );
};
