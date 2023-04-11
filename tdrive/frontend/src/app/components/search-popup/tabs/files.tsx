import * as Text from '@atoms/text';
import Languages from 'app/features/global/services/languages-service';
import { useSearchMessagesFiles } from 'app/features/search/hooks/use-search-files-or-medias';
import { SearchInputState } from 'app/features/search/state/search-input';
import { useRecoilValue } from 'recoil';
import FileResult from '../parts/file-result';
import NothingFound from '../parts/nothing-found';

export default () => {
  const input = useRecoilValue(SearchInputState);
  const isRecent = input?.query?.trim()?.length === 0;
  const { files, loading } = useSearchMessagesFiles();

  if (files.length === 0 && !loading) return <NothingFound />;

  return (
    <div>
      {!!isRecent && (
        <Text.Subtitle className="block">
          {Languages.t('components.searchpopup.recent_files')}
        </Text.Subtitle>
      )}

      <div className={'-mx-2'}>
        <FilesResults />
      </div>
    </div>
  );
};

export const FilesResults = (props: { max?: number }) => {
  const { files, loading } = useSearchMessagesFiles();

  if (files.length === 0 && !loading) return <NothingFound />;

  return (
    <>
      {files.slice(0, props?.max || files.length).map(file => (
        <FileResult key={file.id} file={file} />
      ))}
    </>
  );
};
