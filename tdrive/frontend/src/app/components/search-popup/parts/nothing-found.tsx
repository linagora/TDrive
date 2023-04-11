import { NotFoundIcon } from 'app/atoms/icons-colored';
import Languages from 'app/features/global/services/languages-service';
import { SearchInputState } from 'app/features/search/state/search-input';
import { useRecoilValue } from 'recoil';
import * as Text from '@atoms/text';

export default () => {
  const input = useRecoilValue(SearchInputState);
  return (
    <div className="flex items-center justify-center flex-col h-64">
      <NotFoundIcon className="h-8 w-8 mb-2" />
      <Text.Info className="p-2">
        {Languages.t('components.searchpopup.no_results_for')} “
        <span className="font-semibold">{input?.query}</span>”.{' '}
        {Languages.t('components.searchpopup.try_new_search')}
      </Text.Info>
    </div>
  );
};
