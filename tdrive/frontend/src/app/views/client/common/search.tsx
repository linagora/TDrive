import { Button } from '@atoms/button/button';
import { Input } from '@atoms/input/input-text';
import { AdjustmentsIcon, SearchIcon } from '@heroicons/react/outline';
import { InputDecorationIcon } from '@atoms/input/input-decoration-icon';
import Languages from '@features/global/services/languages-service';
import RouterServices from '@features/router/services/router-service';
import { useSearchModal } from '@features/search/hooks/use-search';
import { SearchInputState } from '@features/search/state/search-input';
import { useRecoilState } from 'recoil';
import { ToasterService } from 'app/features/global/services/toaster-service';

export default (): JSX.Element => {
  const { workspaceId, channelId } = RouterServices.getStateFromRoute();
  const { setOpen: setOpenSearch } = useSearchModal();
  const [searchState, setSearchState] = useRecoilState(SearchInputState);

  const setOpen = () => {
    if (
      searchState.query === '' ||
      (searchState.channelId && searchState.channelId !== channelId)
    ) {
      setSearchState({ query: searchState.query, workspaceId: workspaceId, channelId: channelId });
    }
    setOpenSearch(true);
  };

  return (
    <>
      <div className="w-full max-w-lg">
        <InputDecorationIcon
          prefix={() => (
            <SearchIcon className={'h-5 w-5 absolute m-auto top-0 bottom-0 left-3 text-blue-500'} />
          )}
          suffix={() => (
            <Button
              theme="white"
              size="sm"
              className={
                'rounded-full h-7 w-7 absolute m-auto top-0 bottom-0 right-3 text-zinc-500'
              }
              icon={() => <AdjustmentsIcon className="w-5 h-5 text-zinc-500" />}
              onClick={() => {
                ToasterService.info(Languages.t('components.searchpopup.soon'));
              }}
            />
          )}
          input={({ className }) => (
            <Input
              value={searchState.query}
              className={className + ' text-zinc-500 !h-12 sm:text-left text-center'}
              maxLength={0}
              readOnly
              placeholder={Languages.t('scenes.client.main_view.main_header.search_input')}
              onClick={() => setOpen()}
            />
          )}
        />
      </div>
    </>
  );
};
