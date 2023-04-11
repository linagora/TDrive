import { Modal, ModalContent } from '@atoms/modal';
import Languages from 'app/features/global/services/languages-service';
import { useSearchModal } from 'app/features/search/hooks/use-search';
import { SearchInput } from './search-input';
import { SearchResultsIndex } from './search-tabs';

export default () => {
  const { open, setOpen } = useSearchModal();

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="sm:w-[80vw] sm:max-w-4xl">
      <SearchBox />
    </Modal>
  );
};

const SearchBox = () => {
  return (
    <ModalContent textCenter title={Languages.t('components.searchpopup.header_title')}>
      <SearchInput />
      <SearchResultsIndex />
    </ModalContent>
  );
};
