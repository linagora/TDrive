import { SearchInputState } from '@features/search/state/search-input';
import { useSearchMessages } from 'app/features/search/hooks/use-search-messages';
import { useRecoilValue } from 'recoil';
import MessageResult from '../parts/message-result';
import NothingFound from '../parts/nothing-found';
import NothingSearched from '../parts/nothing-searched';

export default () => {
  return (
    <div>
      <div className="-mx-2">
        <MessagesResults />
      </div>
    </div>
  );
};

export const MessagesResults = () => {
  const input = useRecoilValue(SearchInputState);
  const isRecent = input?.query?.trim()?.length === 0;
  const { messages, loading } = useSearchMessages();

  if (isRecent) return <NothingSearched />;
  if (messages.length === 0 && !loading) return <NothingFound />;

  return (
    <>
      <div className="">
        {messages
          .map(message => {
            return (
              <div key={message.id} className="cursor-pointer block w-full">
                <MessageResult message={message} />
              </div>
            );
          })
          .filter(a => a)}
      </div>
    </>
  );
};
