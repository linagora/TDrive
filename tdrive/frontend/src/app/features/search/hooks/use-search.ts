import { atom, useRecoilState } from 'recoil';

const SearchModalOpenState = atom<boolean>({ key: 'SearchModalOpenState', default: false });

export const useSearchModal = () => {
  const [open, setOpen] = useRecoilState(SearchModalOpenState);
  return {
    open,
    setOpen,
  };
};
