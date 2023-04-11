import { MenuIcon } from '@heroicons/react/outline';
import Account from '../common/account';
import AppGrid from '../common/app-grid';
import Search from '../common/search';

export default ({ openSideMenu }: { openSideMenu: () => void }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 h-16 sm:h-20 p-4 sm:p-6 flex space-between items-center">
      <div className="sm:block hidden shrink-0 w-1/6 max-w-xs" style={{ minWidth: 100 }}>
        <img
          src="/public/img/logo/logo-text-black.png"
          className="h-6 ml-1 dark:hidden block"
          alt="Tdrive"
        />
        <img
          src="/public/img/logo/logo-text-white.png"
          className="h-6 ml-1 dark:block hidden"
          alt="Tdrive"
        />
      </div>
      <div
        onClick={() => openSideMenu()}
        className="sm:hidden block shrink-0 w-10 hover:text-zinc-600 text-zinc-500 cursor-pointer -mx-2 px-2"
      >
        <MenuIcon className="w-6 h-6" />
      </div>

      <div className="ml-4 mr-4 grow">
        <Search />
      </div>

      <div className="sm:block hidden grow"></div>
      <div className="sm:block hidden">
        <AppGrid className="mr-4" />
      </div>
      <Account />
    </div>
  );
};
