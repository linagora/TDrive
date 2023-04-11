import Text from 'app/atoms/text';
import Languages from 'app/features/global/services/languages-service';
import React from 'react';

export default (): React.ReactElement => {
  return (
    <Text type="base" className="text-rose-500" noColor={true}>
      {Languages.t(
        'components.invitation.reached_limit.text',
        [],
        'you reached the maximum number of users inside your company. Increase your subscription or add these users as guests.',
      )}
    </Text>
  );
};
