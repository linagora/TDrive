import { InformationCircleIcon } from '@heroicons/react/outline';
import { SearchIcon } from '@heroicons/react/solid';
import { Alert } from 'app/atoms/alert';
import { InputDecorationIcon } from 'app/atoms/input/input-decoration-icon';
import { Input } from 'app/atoms/input/input-text';
import Text, { Info } from 'app/atoms/text';
import { useSearchChannelMembersAll } from 'app/features/channel-members-search/hooks/use-search-all';
import Languages from 'app/features/global/services/languages-service';
import { delayRequest } from 'app/features/global/utils/managedSearchRequest';
import Strings from 'app/features/global/utils/strings';
import { useInvitationUsers } from 'app/features/invitation/hooks/use-invitation-users';
import { invitationState } from 'app/features/invitation/state/invitation';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import { useEffect, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useRecoilState } from 'recoil';
import { EmailItem } from './email-item';
import { MemberItem } from './member-item';
import { UserItem } from './user-item';
import AccessRightsService from 'app/features/workspace-members/services/workspace-members-access-rights-service';
import { useCurrentWorkspace } from 'app/features/workspaces/hooks/use-workspaces';

export const ChannelMembersListModal = (): JSX.Element => {
  const channelId = useRouterChannel();
  const [query, setQuery] = useState<string>('');

  const { addEmailSuggestion, pendingEmailList, channelMembersList, usersList, search, refresh } =
    useSearchChannelMembersAll({
      channelId,
    });

  useEffect(() => {
    delayRequest('ChannelMembersListModal', async () => {
      search(query);
    });
  }, [search, query]);

  useEffect(() => {
    if (channelId) refresh();
  }, [channelId]);

  return (
    <div
      className="flex flex-col max-w-full space-y-1"
      style={{ height: '80vh', maxHeight: '400px' }}
    >
      <div>
        <InputDecorationIcon
          className="mb-2"
          suffix={SearchIcon}
          input={({ className }) => (
            <Input
              className={className}
              placeholder={Languages.t('scenes.client.channelbar.channelmemberslist.search_invite')}
              onChange={e => {
                setQuery(e.target.value);
              }}
              value={query}
            />
          )}
        />
        {pendingEmailList?.length === 0 && channelMembersList?.length <= 1 && (
          <Alert
            className="mb-0"
            theme="primary"
            title={Languages.t('scenes.client.channelbar.channelmemberslist.search_invite_notice')}
            icon={InformationCircleIcon}
          />
        )}
      </div>
      <div className="-mx-3">
        <PerfectScrollbar
          options={{ suppressScrollX: true, suppressScrollY: false }}
          component="div"
          style={{ width: '100%', height: '100%' }}
        >
          <div className="mx-1">
            {addEmailSuggestion &&
              pendingEmailList?.length === 0 &&
              channelMembersList?.length === 0 &&
              usersList?.length === 0 &&
              !Strings.verifyMail(query) && (
                <>
                  <Info className="px-2 mt-2 block">
                    {Languages.t(
                      'scenes.client.channelbar.channelmemberslist.search_invite_type_email',
                    )}
                  </Info>
                </>
              )}
            {addEmailSuggestion && <EmailSuggestion email={query} />}
            {pendingEmailList?.length > 0 && (
              <>
                <Info className="px-2 mt-2 block">
                  {Languages.t('scenes.client.channelbar.channelmemberslist.pending_section')}
                </Info>
              </>
            )}
            {pendingEmailList &&
              pendingEmailList.map((item, index) => {
                return (
                  <div key={`key_${index}`} className="flex  py-1 hover:bg-zinc-50 rounded-sm px-2">
                    <EmailItem email={item} />
                  </div>
                );
              })}
            {channelMembersList?.length > 0 && (
              <>
                <Info className="px-2 mt-2 block">
                  {Languages.t('scenes.client.channelbar.channelmemberslist.members_section')}
                </Info>
              </>
            )}
            {channelMembersList &&
              channelMembersList
                .filter(a => a && a?.user)
                .map(cMember => {
                  return (
                    <div
                      key={cMember.user_id}
                      className="flex  py-1 hover:bg-zinc-50 rounded-sm px-2"
                    >
                      <MemberItem userId={cMember.user_id} member={cMember} />
                    </div>
                  );
                })}
            {usersList?.length > 0 && (
              <>
                <Info className="px-2 mt-2 block">
                  {Languages.t('scenes.client.channelbar.channelmemberslist.not_members_section')}
                </Info>
              </>
            )}
            {usersList &&
              usersList.map(user => {
                return (
                  <div key={user.id} className="flex  py-1 hover:bg-zinc-50 rounded-sm px-2">
                    <UserItem userId={user.id || ''} />
                  </div>
                );
              })}
          </div>
        </PerfectScrollbar>
      </div>
    </div>
  );
};

const EmailSuggestion = ({ email }: { email: string }) => {
  const [, setInvitationOpen] = useRecoilState(invitationState);
  const { addInvitation, allowed_guests, allowed_members } = useInvitationUsers();
  const { workspace } = useCurrentWorkspace();

  const invite = () => {
    addInvitation(email);
    setInvitationOpen(true);
  };
  if (!email || !Strings.verifyMail(email)) {
    return <></>;
  }

  return AccessRightsService.hasLevel(workspace?.id, 'moderator') &&
    (allowed_guests > 0 || allowed_members > 0) ? (
    <div>
      <Info className="px-2 mt-2 mb-2 block items-center flex">
        <Text type="base" className="cursor-pointer" onClick={() => invite()}>
          {Languages.t(
            'scenes.client.channelbar.channelmemberslist.invite_to_workspace',
            [email],
            `Invite ${email} to the workspace ➡`,
          )}
        </Text>
      </Info>
    </div>
  ) : (
    <></>
  );
};
