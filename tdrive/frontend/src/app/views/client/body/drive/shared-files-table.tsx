import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, DotsHorizontalIcon } from '@heroicons/react/outline';
import { Button } from '@atoms/button/button';
import { Base, BaseSmall, Title } from '@atoms/text';
import Menu from '@components/menus/menu';
import { useRecoilState } from 'recoil';
import {
  useOnBuildFileTypeContextMenu,
  useOnBuildPeopleContextMenu,
  onBuildDateContextMenu,
  useOnBuildFileContextMenu,
} from './context-menu';
import { useSharedWithMeDriveItems } from '@features/drive/hooks/use-shared-with-me-drive-items';
import { SharedWithMeFilterState } from '@features/drive/state/shared-with-me-filter';

export const SharedFilesTable = () => {
  const { driveItems, loading } = useSharedWithMeDriveItems();
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // FILTER HOOKS
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  const buildFileTypeContextMenu = useOnBuildFileTypeContextMenu();
  const buildPeopleContextMen = useOnBuildPeopleContextMenu();
  const onBuildFileContextMenu = useOnBuildFileContextMenu();

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        return <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />;
      } else {
        return <ChevronUpIcon className="h-4 w-4 ml-2 -mr-1" />;
      }
    }
    return null;
  };
  return (
    <>
      <Title className="mb-4 block">Shared with me</Title>
      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Menu menu={() => buildFileTypeContextMenu()}>
            <Button theme="secondary" className="flex items-center">
              <span>{filter.mimeType ? filter.mimeType : "File Type"}</span>
              <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
            </Button>
          </Menu>
        </div>

        <div className="flex items-center space-x-2">
          <Menu menu={() => buildPeopleContextMen()}>
            <Button theme="secondary" className="flex items-center">
              <span>People</span>
              <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
            </Button>
          </Menu>
        </div>

        <div className="flex items-center space-x-2">
          <Menu menu={() => onBuildDateContextMenu()}>
            <Button theme="secondary" className="flex items-center">
              <span>Last Modified</span>
              <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
            </Button>
          </Menu>
        </div>
      </div>
      <Title className="mb-4 block">Documents:</Title>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-blue-500 dark:text-white">
            <tr>
              <th scope="col" className="px-6 py-3">
                <span className="flex" onClick={() => handleSort('name')}>
                  Name {renderSortIcon('name')}
                </span>
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="flex" onClick={() => handleSort('name')}>
                  Shared By {renderSortIcon('name')}
                </span>
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="flex" onClick={() => handleSort('name')}>
                  Shared Date {renderSortIcon('name')}
                </span>
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              driveItems
                .sort((a: any, b: any) => {
                  // Perform sorting based on the selected column and order
                  console.log("a is: ", a);
                  console.log("b is: ", b);
                  if (sortBy === 'name') {
                    return sortOrder === 'asc'
                      ? a.name.localeCompare(b.name)
                      : b.name.localeCompare(a.name);
                  }
                  return 0; // No sorting by default
                })
                .map((file: any, index: any) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {file.name}
                    </th>
                    <td className="px-6 py-4">Dwho</td>
                    <td className="px-6 py-4">2023-05-05</td>
                    <td className="px-6 py-4 text-right">
                      <Menu menu={onBuildFileContextMenu(file)}>
                        <Button
                          theme={'secondary'}
                          size="sm"
                          className={'!rounded-full '}
                          icon={DotsHorizontalIcon}
                        />
                      </Menu>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
