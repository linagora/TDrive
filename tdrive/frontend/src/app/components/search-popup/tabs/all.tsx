import * as Text from '@atoms/text';
import A from 'app/atoms/link';
import Languages from 'app/features/global/services/languages-service';
import { useSearchChannels } from 'app/features/search/hooks/use-search-channels';
import {
  useSearchMessagesFiles,
  useSearchMessagesMedias,
} from 'app/features/search/hooks/use-search-files-or-medias';
import { useSearchMessages } from 'app/features/search/hooks/use-search-messages';
import { SearchInputState, SearchTabsState } from 'app/features/search/state/search-input';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ChannelsResults, ChannelsRowResults } from './channels';
import { FilesResults } from './files';
import { MediasResults } from './medias';
import { MessagesResults } from './messages';

export default () => {
  const setTab = useSetRecoilState(SearchTabsState);

  const input = useRecoilValue(SearchInputState);
  const isRecent = input?.query?.trim()?.length === 0;

  const { channels } = useSearchChannels();
  const { messages } = useSearchMessages();
  const { files } = useSearchMessagesFiles();
  const { files: medias } = useSearchMessagesMedias();

  return (
    <div className="-mt-4">
      {channels.length > 0 && (
        <>
          <div className="flex mt-4">
            <Text.Subtitle className="block grow">
              {isRecent
                ? Languages.t('components.searchpopup.recent_channels_and_contacts')
                : Languages.t('components.searchpopup.channels')}
            </Text.Subtitle>
            {channels.length > 6 && (
              <div className="w-auto">
                <A onClick={() => setTab('channels')}>
                  {Languages.t('components.searchpopup.see_more')}
                </A>
              </div>
            )}
          </div>
          {isRecent && (
            <div className="-mx-2 mt-2">
              <ChannelsRowResults max={6} />
            </div>
          )}
          {!isRecent && (
            <div className="-mx-2">
              <ChannelsResults max={6} />
            </div>
          )}
        </>
      )}

      {medias.length > 0 && (
        <>
          <div className="flex mt-4">
            <Text.Subtitle className="block grow">
              {isRecent
                ? Languages.t('components.searchpopup.recent_media')
                : Languages.t('components.searchpopup.media')}
            </Text.Subtitle>
            {medias.length > 6 && (
              <div className="w-auto">
                <A onClick={() => setTab('medias')}>
                  {Languages.t('components.searchpopup.see_more')}
                </A>
              </div>
            )}
          </div>
          <div className={'-mx-2'}>
            <MediasResults max={6} showAsFiles={!isRecent} />
          </div>
        </>
      )}

      {files.length > 0 && (
        <>
          <div className="flex mt-4">
            <Text.Subtitle className="block grow">
              {isRecent
                ? Languages.t('components.searchpopup.recent_files')
                : Languages.t('components.searchpopup.files')}
            </Text.Subtitle>
            {files.length > 6 && (
              <div className="w-auto">
                <A onClick={() => setTab('files')}>
                  {Languages.t('components.searchpopup.see_more')}
                </A>
              </div>
            )}
          </div>
          <div className={'-mx-2'}>
            <FilesResults max={6} />
          </div>
        </>
      )}

      {messages.length > 0 && (
        <>
          <div className="flex mt-4">
            <Text.Subtitle className="block grow">
              {Languages.t('components.searchpopup.messages')}
            </Text.Subtitle>
          </div>
          <div className="-mx-2">
            <MessagesResults />
          </div>
        </>
      )}
    </div>
  );
};
