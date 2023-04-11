import Avatar from 'app/atoms/avatar';
import { Base, Info } from 'app/atoms/text';
import Menu from 'app/components/menus/menu';
import LoginService from 'app/features/auth/login-service';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import currentUserService from 'app/features/users/services/current-user-service';
import AccountParameter from 'app/views/client/popup/UserParameter/UserParameter';
import Languages from '../../../features/global/services/languages-service';
import ModalManagerDepreciated from 'app/deprecated/popupManager/popupManager';

export default ({ sidebar }: { sidebar?: boolean }): JSX.Element => {
  const { user } = useCurrentUser();

  if (!user) return <></>;

  return (
    <Menu
      className="flex flex-row items-center max-w-xs cursor-pointer"
      position="bottom"
      menu={[
        {
          type: 'menu',
          icon: 'user',
          text: Languages.t('scenes.app.channelsbar.currentuser.title'),
          onClick: () => {
            ModalManagerDepreciated.open(<AccountParameter />, true, 'account_parameters');
          },
        },
        {
          type: 'menu',
          icon: 'sign-out-alt',
          text: Languages.t('scenes.app.channelsbar.currentuser.logout'),
          className: 'error',
          onClick: () => {
            LoginService.logout();
          },
        },
      ]}
    >
      <Avatar
        size="md"
        className="shrink-0 border-0"
        avatar={user.thumbnail}
        title={currentUserService.getFullName(user)}
      />
      <div
        className={'sm:block ml-2 mr-2 flex flex-col overflow-hidden ' + (sidebar ? '' : 'hidden')}
      >
        <Base className="font-bold overflow-hidden text-ellipsis whitespace-nowrap w-full block -mb-1">
          {currentUserService.getFullName(user)}
        </Base>
        <Info className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full">
          {user.email}
        </Info>
      </div>
    </Menu>
  );
};
