import { useSearchUsers } from 'app/features/users/hooks/use-search-user-list';
import { useRecoilValue } from 'recoil';
import { SearchChannelMemberInputState } from '../state/search-channel-member';

export const useSearchFilteredUsers = () => {
  const searchInput = useRecoilValue(SearchChannelMemberInputState);
  const { result: filteredUsers } = useSearchUsers({ scope: 'company' });
  let filteredList = filteredUsers;

  if (searchInput) {
    filteredList = filteredUsers.filter(({ email }) => {
      return searchInput.split(' ').every(item => {
        return email.includes(item);
      });
    });
  }

  return {
    filteredPendingEmails: filteredList,
  };
};
