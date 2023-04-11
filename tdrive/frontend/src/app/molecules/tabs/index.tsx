/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect } from 'react';

// @ts-ignore
interface TabsProps extends React.InputHTMLAttributes<HTMLInputElement> {
  tabs: JSX.Element[] | string[];
  selected: number;
  onClick: (idx: number) => void;
  parentClassName?: string;
}

const defaultTabClassName =
  ' cursor-pointer h-12 px-4 flex items-center border-b-2 border-transparent hover:text-blue-600 transition-colors';
const activeTabClassName = ' text-blue-500 border-blue-500 font-semibold ';
const inactiveTabClassName = ' text-zinc-500 ';

export default function Tab(props: TabsProps) {
  useEffect(() => {
    if (props.selected >= props.tabs.length) props.onClick(0);
  }, [props.tabs.length]);

  return (
    <>
      <div
        className={`overflow-auto flex w-100 border-b border-zinc-200 dark:border-zinc-800 transition-all select-none ${props.className}`}
      >
        {props.tabs.map((tab, idx) => {
          const cl =
            defaultTabClassName +
            (idx === props.selected ? activeTabClassName : inactiveTabClassName) +
            props.parentClassName;
          return (
            <div key={idx} className={cl} onClick={() => props.onClick(idx)}>
              {tab}
            </div>
          );
        })}
      </div>
    </>
  );
}
