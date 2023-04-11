import { Button } from 'app/atoms/button/button';
import React, { useState } from 'react';
import { CopyIcon } from '@atoms/icons-agnostic';
import { Base } from 'app/atoms/text';
import { useInvitation } from 'app/features/invitation/hooks/use-invitation';
import Languages from 'app/features/global/services/languages-service';
import MagicLinks from 'app/views/client/popup/AddUser/MagicLinks';
import { Input } from 'app/atoms/input/input-text';
import { InputDecorationIcon } from 'app/atoms/input/input-decoration-icon';
import { LinkIcon } from '@heroicons/react/outline';
import { copyToClipboard } from 'app/features/global/utils/CopyClipboard';
import { ToasterService } from 'app/features/global/services/toaster-service';

export default (): React.ReactElement => {
  const { generateInvitationLink } = useInvitation();
  const [loading, setLoading] = useState<boolean>(false);

  const copyLink = async () => {
    setLoading(true);
    const link = await generateInvitationLink();

    if (link) {
      copyToClipboard(link);
      ToasterService.success('Link copied to clipboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-row  w-full">
      <InputDecorationIcon
        className="grow  grow w-full"
        input={({ className }) => (
          <Input
            className={className + ' rounded-r-none pointer-events-none'}
            theme="plain"
            readOnly
            value={Languages.t(
              'components.invitation.workspace_link.text',
              [],
              'Workspace invitation link',
            )}
          />
        )}
        prefix={LinkIcon}
      />
      <Button
        className="h-7 2 rounded-l-none -ml-px"
        theme="primary"
        icon={CopyIcon}
        onClick={() => copyLink()}
        loading={loading}
        disabled={loading}
      >
        {Languages.t('components.invitation.workspace_link.copy', [], 'Copy')}
      </Button>
    </div>
  );
};
