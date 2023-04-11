/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchInputState } from 'app/features/search/state/search-input';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useRecoilValue } from 'recoil';
import SearchResulsDriveItems from './tabs/drive';

export const SearchResultsIndex = () => {
  return (
    <>
      <PerfectScrollbar
        className="-mb-4 py-3 overflow-hidden -mx-2 px-2"
        style={{ maxHeight: 'calc(80vh - 100px)', minHeight: 'calc(80vh - 100px)' }}
        options={{ suppressScrollX: true, suppressScrollY: false }}
        component="div"
      >
        <SearchResulsDriveItems />
      </PerfectScrollbar>
    </>
  );
};

const SearchCounterBadge = (props: { count: number }) => {
  const count = props.count < 100 ? props.count : '99+';
  return (
    <div className="bg-zinc-200 ml-2 px-1.5 text-sm rounded-full text-zinc-500 dark:bg-zing-800 dark:text-zinc-600">
      {count}
    </div>
  );
};
