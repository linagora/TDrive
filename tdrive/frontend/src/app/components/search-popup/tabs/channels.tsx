import * as Text from '@atoms/text';
import Languages from 'app/features/global/services/languages-service';
import { useSearchChannels } from 'app/features/search/hooks/use-search-channels';
import { SearchInputState } from 'app/features/search/state/search-input';
import { useRecoilValue } from 'recoil';
import ChannelLineResult from '../parts/channel-line-result';
import ChannelResult from '../parts/channel-result';
import NothingFound from '../parts/nothing-found';

export default () => {
  const input = useRecoilValue(SearchInputState);
  const isRecent = input?.query?.trim()?.length === 0;
  const { channels, loading } = useSearchChannels();

  if (channels.length === 0 && !loading) return <NothingFound />;

  const topChannels = channels
    .slice()
    .filter(a => Date.now() - (a.last_activity || 0) < 1000 * 60 * 60 * 24 * 31)
    .sort((a, b) => Math.min(50, b?.stats?.messages || 0) - Math.min(50, a?.stats?.messages || 0))
    .slice(0, 5);

  return (
    <div>
      {!!isRecent && !!topChannels.length && (
        <div className="mb-4">
          <Text.Subtitle className="block">
            {Languages.t('components.searchpopup.recent_channels_and_contacts')}
          </Text.Subtitle>

          <div className="-mx-2 mt-2 items-top">
            {topChannels.map(channel => (
              <div
                className="mx-2 inline-block align-top	hover:opacity-75 cursor-pointer"
                key={channel.id}
              >
                <ChannelResult channel={channel} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!!isRecent && (
        <Text.Subtitle className="block">
          {Languages.t('components.searchpopup.channels')}
        </Text.Subtitle>
      )}
      <div className={'-mx-2'}>
        <ChannelsResults />
      </div>
    </div>
  );
};

export const ChannelsRowResults = (props: { max?: number }) => {
  const { channels, loading } = useSearchChannels();

  if (channels.length === 0 && !loading) return <NothingFound />;

  return (
    <>
      {channels.slice(0, props?.max || channels.length).map(channel => (
        <div
          className="mx-2 inline-block align-top	hover:opacity-75 cursor-pointer"
          key={channel.id}
        >
          <ChannelResult channel={channel} />
        </div>
      ))}
    </>
  );
};

export const ChannelsResults = (props: { max?: number }) => {
  const { channels, loading } = useSearchChannels();

  if (channels.length === 0 && !loading) return <NothingFound />;

  return (
    <>
      {channels.slice(0, props?.max || channels.length).map(channel => (
        <ChannelLineResult key={channel.id} channel={channel} />
      ))}
    </>
  );
};
