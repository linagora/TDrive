import { InputDecorationIcon } from '@atoms/input/input-decoration-icon';
import { SearchIcon } from '@heroicons/react/solid';
import { Input } from 'app/atoms/input/input-text';
import { Loader } from 'app/atoms/loader';
import Languages from 'app/features/global/services/languages-service';
import { useSearchChannelsLoading } from 'app/features/search/hooks/use-search-channels';
import {
  useSearchMessagesFilesLoading,
  useSearchMessagesMediasLoading,
} from 'app/features/search/hooks/use-search-files-or-medias';
import { useSearchDriveItemsLoading } from 'app/features/search/hooks/use-search-drive-items';
import { useSearchMessagesLoading } from 'app/features/search/hooks/use-search-messages';
import { SearchInputState } from 'app/features/search/state/search-input';
import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';

export const SearchInput = () => {
  const [input, setInput] = useRecoilState(SearchInputState);

  const inputElement = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputElement.current) inputElement.current.focus();
  }, []);

  const channelsLoading = useSearchChannelsLoading();
  const messagesLoading = useSearchMessagesLoading();
  const filesLoading = useSearchMessagesFilesLoading();
  const mediasLoading = useSearchMessagesMediasLoading();
  const driveItemsLoading = useSearchDriveItemsLoading();

  const loading =
    channelsLoading || messagesLoading || filesLoading || mediasLoading || driveItemsLoading;

  return (
    <div className="relative flex mt-2 w-full">
      <InputDecorationIcon
        className="grow"
        prefix={
          loading
            ? ({ className }) => (
                <div className={className + ' !h-6'}>
                  <Loader className="h-4 w-4" />
                </div>
              )
            : SearchIcon
        }
        input={({ className }) => (
          <Input
            inputRef={inputElement}
            onChange={e => setInput({ ...input, query: e.target.value })}
            value={input.query}
            className={className}
            placeholder={Languages.t('scenes.app.mainview.quick_search_placeholder')}
          />
        )}
      />
    </div>
  );
};
