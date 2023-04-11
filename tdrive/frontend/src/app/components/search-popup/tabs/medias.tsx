import * as Text from '@atoms/text';
import FileUploadAPIClient from '@features/files/api/file-upload-api-client';
import Languages from '@features/global/services/languages-service';
import { useSearchMessagesMedias } from '@features/search/hooks/use-search-files-or-medias';
import { SearchInputState } from '@features/search/state/search-input';
import { useRecoilValue } from 'recoil';
import FileResult from '../parts/file-result';
import MediaResult from '../parts/media-result';
import NothingFound from '../parts/nothing-found';

export default () => {
  const input = useRecoilValue(SearchInputState);
  const isRecent = input?.query?.trim()?.length === 0;

  return (
    <div>
      {!!isRecent && (
        <Text.Subtitle className="block">
          {Languages.t('components.searchpopup.recent_media')}
        </Text.Subtitle>
      )}

      <div className="-mx-2">
        <MediasResults showAsFiles={!isRecent} />
      </div>
    </div>
  );
};

export const MediasResults = (props: { max?: number; showAsFiles?: boolean }) => {
  const { files, loading } = useSearchMessagesMedias();

  if (files.length === 0 && !loading) return <NothingFound />;

  return (
    <>
      {files
        .slice(0, props?.max || files.length)
        .map(file => {
          const url = FileUploadAPIClient.getFileThumbnailUrlFromMessageFile(file);
          if (url || props.showAsFiles)
            return props.showAsFiles ? (
              <FileResult key={file.id} file={file} />
            ) : (
              <MediaResult key={file.id} file={file} />
            );
        })
        .filter(a => a)}
    </>
  );
};
