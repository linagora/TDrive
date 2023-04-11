import UserBlock from 'app/molecules/grouped-rows/user';
import { Modal, ModalContent } from 'app/atoms/modal';
import messageApiClient from 'app/features/messages/api/message-api-client';
import { UserType } from 'app/features/users/types/user';
import React, { useEffect, useState } from 'react';
import Avatar from 'app/atoms/avatar';
import { useMessageSeenBy } from 'app/features/messages/hooks/use-message-seen-by';
import Loader from '../loader/loader';
import Languages from 'app/features/global/services/languages-service';
import { Base } from 'app/atoms/text';

export default (): React.ReactElement => {
  const { isOpen, closeSeenBy, seenMessage } = useMessageSeenBy();
  const [users, setUsers] = useState<UserType[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && seenMessage) {
      const { company_id, message_id, thread_id, workspace_id } = seenMessage;

      setLoading(true);
      messageApiClient.seenBy(message_id, thread_id, company_id, workspace_id).then(users => {
        setLoading(false);
        setUsers(users);
      });
    }
  }, [open, seenMessage]);

  return (
    <Modal open={isOpen} onClose={() => closeSeenBy()} className="sm:w-[60vw] sm:max-w-2xl">
      <ModalContent
        textCenter
        title={Languages.t('components.message_seen_by.title', [], "Users who've seen the message")}
      >
        {loading ? (
          <div className="flex h-full justify-center items-center px-2">
            <Loader className="h-8 w-8 m-auto" />
          </div>
        ) : (
          <div className="flex">
            <div className="w-[60vw] rounded-sm px-2 m-2">
              {users && users.length ? (
                users.map(user => (
                  <UserBlock
                    avatar={
                      <Avatar title={user.full_name ?? user.username} avatar={user.thumbnail} />
                    }
                    title={user.full_name ?? user.username}
                    subtitle={user.email}
                    key={user.id}
                  />
                ))
              ) : (
                <Base className='pt-4'>
                  {Languages.t(
                    'components.message_seen_by.none_seen_it',
                    [],
                    'No one has seen the message yet',
                  )}
                </Base>
              )}
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};
