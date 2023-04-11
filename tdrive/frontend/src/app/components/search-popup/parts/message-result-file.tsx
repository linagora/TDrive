import * as Text from '@atoms/text';

import { Button } from 'app/atoms/button/button';
import { DownloadIcon } from 'app/atoms/icons-agnostic';
import { formatDate } from 'app/features/global/utils/format-date';
import { formatSize } from 'app/features/global/utils/format-file-size';
import { Message, MessageFileType } from 'app/features/messages/types/message';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useSearchModal } from 'app/features/search/hooks/use-search';
import { SearchInputState } from 'app/features/search/state/search-input';
import { UserType } from 'app/features/users/types/user';
import { useFileViewerModal } from 'app/features/viewer/hooks/use-viewer';
import { ArrowRight } from 'react-feather';
import Highlighter from 'react-highlight-words';
import { useRecoilValue } from 'recoil';
import { onFileDownloadClick, openMessage } from '../common';
import { FileResultMedia } from './file-result';

export default (props: { file: MessageFileType & { message?: Message } & { user?: UserType } }) => {
  const input = useRecoilValue(SearchInputState);
  const currentWorkspaceId = useRouterWorkspace();
  const file = props.file;
  const name = file?.metadata?.name;
  const extension = name?.split('.').pop();

  const { setOpen } = useSearchModal();
  const { open: openViewer } = useFileViewerModal();

  return (
    <div
      className="flex items-center p-2 rounded-md cursor-pointer"
      onClick={() => openViewer(file)}
    >
      <FileResultMedia size="sm" file={file} className=" w-12 h-12 mr-3" />
      <div className="grow mr-3 overflow-hidden">
        <Text.Base className="block whitespace-nowrap overflow-hidden text-ellipsis">
          <Highlighter
            highlightClassName="text-blue-500 p-0 bg-blue-50"
            searchWords={input?.query?.split(' ')}
            autoEscape={true}
            textToHighlight={name}
          />
        </Text.Base>
        <Text.Info className="block">
          {extension?.toLocaleUpperCase()} • {formatDate(file?.message?.created_at)} •{' '}
          {formatSize(file?.metadata?.size)}
        </Text.Info>
      </div>
      <div
        className="whitespace-nowrap"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Button
          theme="outline"
          className="w-9 px-1.5 ml-2 rounded-full border-none"
          onClick={() => onFileDownloadClick(file)}
        >
          <DownloadIcon className="text-blue-500 w-6 h-6" />
        </Button>

        {!!file.message && (
          <Button
            theme="outline"
            className="w-9 px-1.5 ml-2 rounded-full border-none"
            onClick={() => {
              openMessage(file.message as Message, currentWorkspaceId);
              setOpen(false);
            }}
          >
            <ArrowRight className="text-blue-500 w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
};
