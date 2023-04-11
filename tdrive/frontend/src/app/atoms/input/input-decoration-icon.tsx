/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';

interface InputLabelProps {
  prefix?: (props: any) => JSX.Element;
  suffix?: (props: any) => JSX.Element;
  input: ({ className }: { className: string }) => ReactNode;
  className?: string;
}

export const InputDecorationIcon = (props: InputLabelProps) => {
  return (
    <div className={'relative ' + props.className}>
      {props.prefix && (
        <props.prefix className="h-4 w-4 absolute m-auto top-0 bottom-0 left-3 text-zinc-500" />
      )}
      {props.input({ className: (props.prefix ? 'pl-9 ' : '') + (props.suffix ? 'pr-9 ' : '') })}
      {props.suffix && (
        <props.suffix className="h-4 w-4 absolute m-auto top-0 bottom-0 right-3 text-zinc-500" />
      )}
    </div>
  );
};
