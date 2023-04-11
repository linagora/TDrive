/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';

// @ts-ignore

interface MediaProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size: 'lg' | 'md' | 'sm';
  url: string;
  duration?: string;
}

export default function Media(props: MediaProps) {
  const size = { lg: 32, md: 16, sm: 12 }[props.size];

  let timing = undefined;

  if (props.duration) {
    timing = '▶ ' + props.duration;
    switch (props.size) {
      case 'sm':
        timing = '▶';
        break;
      case 'md':
        if (props.duration.length > 6) {
          timing = props.duration;
        }
    }
  }

  const wrpClassName = `relative border border-zinc-200 rounded-md overflow-hidden cursor-inherit w-${size} h-${size}`;
  const imgClassName = `object-cover w-${size} h-${size} border border-zinc-300`;
  return (
    <div className={wrpClassName}>
      <img
        src={props.url}
        className={imgClassName}
        onError={e => (e.currentTarget.style.display = 'none')}
      />
      {timing && (
        <div className={'absolute bottom-1 max-w-full right-1'}>
          <div className="ml-[7px] text-white bg-black/50 rounded-md truncate whitespace-nowrap px-1.5 text-xs">
            {timing}
          </div>
        </div>
      )}
    </div>
  );
}
