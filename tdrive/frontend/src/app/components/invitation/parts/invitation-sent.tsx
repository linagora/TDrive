import { SentIcon } from 'app/atoms/icons-colored';
import { Title, Base } from 'app/atoms/text';
import Link from 'app/atoms/link';
import React from 'react';
import { Button } from 'app/atoms/button/button';
import { useInvitation } from 'app/features/invitation/hooks/use-invitation';
import Languages from 'app/features/global/services/languages-service';

export default (): React.ReactElement => {
  const { reset } = useInvitation();

  return (
    <div className="flex flex-col text-center h-full" style={{ minHeight: 'calc(66vh - 92px)' }}>
      <div className="flex justify-center text-center w-full">
        <SentIcon className="h-52	w-52" />
      </div>
      <div className="text-center w-full py-2 mx-4 px-6">
        <Title className="text-4xl">
          {Languages.t(
            'components.invitation.invitation_sent.title',
            [],
            'Invitations have successfully been sent',
          )}
        </Title>
      </div>
      <div className="text-center w-full py-3 mx-4 px-6">
        <Base>
          {Languages.t(
            'components.invitation.invitation_sent.subtitle_status',
            [],
            'You can track invitaion status in:',
          )}

          {Languages.t(
            'components.invitation.invitation_sent.subtitle_location',
            [],
            'Workspace settings > Member management',
          )}
        </Base>
      </div>
      <div className="text-center w-full py-3">
        <Link>
          {Languages.t('components.invitation.invitation_sent.link', [], 'Check invitation status')}
        </Link>
      </div>
      <div className="flex grow h-full flex-col-reverse">
        <Button className="mt-2 justify-center w-full" onClick={() => reset()}>
          {Languages.t('components.invitation.invitation_sent.button', [], 'Send more invitations')}
        </Button>
      </div>
    </div>
  );
};
