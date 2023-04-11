import { NotFoundIcon } from 'app/atoms/icons-colored';
import Languages from 'app/features/global/services/languages-service';
import * as Text from '@atoms/text';

export default () => {
  return (
    <div className="flex items-center justify-center flex-col h-64">
      <NotFoundIcon className="h-8 w-8 mb-2" />
      <Text.Info className="p-2">{Languages.t('components.searchpopup.start_search')}</Text.Info>
    </div>
  );
};
