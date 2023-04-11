import React, { useState } from 'react';
import { Input, Typography } from 'antd';

import { Application } from 'app/features/applications/types/application';

const { Text } = Typography;
export const ApplicationDisplay = ({
  application,
  onChangeApplicationDisplay,
}: {
  application: Application;
  onChangeApplicationDisplay?: (api: Application['display']) => void;
}) => {
  const [error, setError] = useState<boolean>(false);

  return (
    <>
      <div className="small-bottom-margin" style={{ height: 18 }}>
        {/* TODO: Tranlation here */}
        {error && <Text type="danger">Bad format</Text>}
      </div>
      <Input.TextArea
        status={error ? 'error' : ''}
        defaultValue={JSON.stringify(application.display, null, 2)}
        onChange={e => {
          try {
            const display = JSON.parse(e.target.value) as Application['display'];

            if (display && onChangeApplicationDisplay) {
              setError(false);

              onChangeApplicationDisplay(display);
            }
          } catch (e) {
            setError(true);
          }
        }}
        style={{ minHeight: 400 }}
      />
    </>
  );
};
