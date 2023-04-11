import { atom } from 'recoil';

export type SearchInput = {
  query: string;

  //Scope
  workspaceId?: string;
  channelId?: string;

  //Additional filters (for later)
  //TODO
};

export const SearchInputState = atom<SearchInput>({
  key: 'SearchInputState',
  default: {
    query: '',
  },
});

export const SearchTabsState = atom<'all' | 'channels' | 'messages' | 'files' | 'medias' | 'drive'>({
  key: 'SearchTabsState',
  default: 'all',
});
