import React from 'react';
import { Button } from 'app/atoms/button/button';
import { Subtitle } from 'app/atoms/text';
import { X } from 'react-feather';
import Languages from 'app/features/global/services/languages-service';

type PropsType = {
  onBannerClose: () => void;
  download: () => void;
};

export default ({ onBannerClose, download }: PropsType): React.ReactElement => {
  return (
    <div className="bg-linear-purple w-full hidden sm:block">
      <div className="flex items-center justify-center h-full space-x-4 px-4 py-2">
        <Subtitle className="text-right basis-3/5 !text-white">
          {Languages.t('molecules.download_banner.title')}
        </Subtitle>
        <Button theme="secondary" onClick={() => download()}>
          {Languages.t('molecules.download_banner.download_button')}
        </Button>
        <div className="grow items-end">
          <X
            className="text-2xl float-right text-white cursor-pointer"
            onClick={() => onBannerClose()}
          />
        </div>
      </div>
    </div>
  );
};
