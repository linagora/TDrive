// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React from 'react';
import { useOnlineUsers } from 'app/features/users/hooks/use-online-users';

/**
 * This hook will be global to application
 */
export default (): JSX.Element => {
  useOnlineUsers();
  return <></>;
};
