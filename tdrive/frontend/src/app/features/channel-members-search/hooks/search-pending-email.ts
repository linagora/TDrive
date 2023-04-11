import { useRecoilValue } from 'recoil';
import { SearchChannelMemberInputState } from '../state/search-channel-member';
import { ParamsChannelMember } from '../types/channel-members';
import { useChannelPendingEmails } from './use-pending-emails';

export const useSearchChannelPendingEmail = (params?: ParamsChannelMember) => {
  const searchInput = useRecoilValue(SearchChannelMemberInputState);
  const { pendingEmails } = useChannelPendingEmails(params);
  let filteredList = pendingEmails;

  if (searchInput) {
    filteredList = pendingEmails.filter(({ email }) => {
      return searchInput.split(' ').every(() => {
        return email.includes(searchInput);
      });
    });
  }

  return {
    filteredPendingEmails: filteredList,
  };
};
