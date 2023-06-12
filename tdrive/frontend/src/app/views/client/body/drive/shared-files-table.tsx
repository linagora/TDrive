import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, DotsHorizontalIcon } from '@heroicons/react/outline';
import { Button } from '@atoms/button/button';
import { Base, BaseSmall, Title } from '@atoms/text';
import Menu from '@components/menus/menu';
import {
  onBuildFileTypeContextMenu,
  onBuildPeopleContextMenu,
  onBuildDateContextMenu,
  onBuildFileContextMenu,
} from './context-menu';

export const SharedFilesTable = (documents: any) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
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
          <Menu menu={() => onBuildFileTypeContextMenu()}>
            <Button theme="secondary" className="flex items-center">
              <span>File Type</span>
              <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
            </Button>
          </Menu>
        </div>

        <div className="flex items-center space-x-2">
          <Menu menu={() => onBuildPeopleContextMenu()}>
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
      {/* Table */}
      <div className="flex flex-col w-full space-y-4">
        <div className="flex items-center space-x-4 -mt-px px-4 py-3 rounded-t-md border border-zinc-200 dark:border-zinc-800">
          <div className="flex-grow">
            <div className="grow text-ellipsis whitespace-nowrap overflow-hidden">
              <Base>
                <span className="flex" onClick={() => handleSort('name')}>Name {renderSortIcon('name')}</span>
              </Base>
            </div>
          </div>
          <div className="flex-grow">
            <div className="grow text-ellipsis whitespace-nowrap overflow-hidden">
              <Base>Shared By</Base>
            </div>
          </div>
          <div className="flex-grow">
            <div className="grow text-ellipsis whitespace-nowrap overflow-hidden">
              <Base>Shared Date</Base>
            </div>
          </div>
          <div className="flex-grow-0 w-8"></div>
        </div>
        {documents.items
          .sort((a: any, b: any) => {
            // Perform sorting based on the selected column and order
            if (sortBy === 'name') {
              return sortOrder === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            }
            return 0; // No sorting by default
          })
          .map((file: any, index: any) => (
            <div
              key={index}
              className="flex items-center space-x-4 px-4 py-3 rounded-md border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex-grow">
                <div className="grow text-ellipsis whitespace-nowrap overflow-hidden">
                  <BaseSmall>{file.name}</BaseSmall>
                </div>
              </div>
              <div className="flex-grow">
                <div className="grow text-ellipsis whitespace-nowrap overflow-hidden">
                  <BaseSmall>Dwho</BaseSmall>
                </div>
              </div>
              <div className="flex-grow">
                <div className="grow text-ellipsis whitespace-nowrap overflow-hidden">
                  <BaseSmall>2023-06-09</BaseSmall>
                </div>
              </div>
              <div className="flex-grow-0 w-8">
                <div className="shrink-0 ml-4">
                  <Menu menu={onBuildFileContextMenu}>
                    <Button
                      theme={'secondary'}
                      size="sm"
                      className={'!rounded-full '}
                      icon={DotsHorizontalIcon}
                    />
                  </Menu>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
