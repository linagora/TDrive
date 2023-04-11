// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React from 'react';
import Languages from 'app/features/global/services/languages-service';

type PropsType = {
  message?: string;
};

export default (props: PropsType) => (
  <div
    id="application_loader"
    style={{
      display: 'flex',
      justifyContent: 'center',
      position: 'absolute',
      // push it below the infinite loader which is defined in index.html
      top: 'calc(50% + 50px)',
      width: '100%',
      color: 'var(--white)',
      textAlign: 'center',
    }}
  >
    <div>
      {props.message ||
        Languages.t(
          'application.load.longer',
          [],
          'Server takes longer than expected to reply, please wait or reload the page...',
        )}
    </div>
  </div>
);
