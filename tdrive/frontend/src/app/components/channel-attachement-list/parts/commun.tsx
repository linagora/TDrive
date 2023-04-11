import { Loader } from 'app/atoms/loader';
import { Info } from 'app/atoms/text';
import Languages from 'app/features/global/services/languages-service';
import React from 'react';

export const LoadingAttachements = (): React.ReactElement => {
  return (
    <div className="flex h-full justify-center items-center px-2">
      <Loader className="h-8 w-8 m-auto" />
    </div>
  );
};

export const NoAttachements = (): React.ReactElement => {
  return (
    <div className="flex items-center justify-center flex-col h-64 px-2">
      <Info className="p-2">
        {Languages.t('components.channel_attachement_list.nothing_found')}
      </Info>
    </div>
  );
};
