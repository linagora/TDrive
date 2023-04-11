import React from 'react';
import _ from 'lodash';
import { ReactNode } from 'react';

type TextProps = {
  type: 'title' | 'subtitle' | 'base' | 'base-small' | 'info' | 'info-small';
  children: ReactNode | ReactNode[];
  className?: string;
  noColor?: boolean;
} & Omit<
  React.ButtonHTMLAttributes<HTMLSpanElement>,
  'children' | 'className' | 'type' | 'noColor'
>;

type TypedTextProps = Omit<TextProps, 'type'>;

export const Title = (props: TypedTextProps) => Text({ type: 'title', ...props });

export const Subtitle = (props: TypedTextProps) => Text({ type: 'subtitle', ...props });

export const Base = (props: TypedTextProps) => Text({ type: 'base', ...props });

export const BaseSmall = (props: TypedTextProps) => Text({ type: 'base-small', ...props });

export const Info = (props: TypedTextProps) => Text({ type: 'info', ...props });

export const InfoSmall = (props: TypedTextProps) => Text({ type: 'info-small', ...props });

const Text = (props: TextProps) => {
  let defaultClassName = '';

  switch (props.type) {
    case 'title':
      defaultClassName =
        'text-lg font-semibold block ' +
        ' ' +
        (props.noColor ? '' : 'text-zinc-900 dark:text-white');
      break;
    case 'subtitle':
      defaultClassName =
        'text-base font-semibold' + ' ' + (props.noColor ? '' : 'text-zinc-800 dark:text-white');
      break;
    case 'base':
      defaultClassName =
        'text-base font-normal' + ' ' + (props.noColor ? '' : 'text-zinc-800 dark:text-white');
      break;
    case 'base-small':
      defaultClassName =
        'text-sm font-normal' + ' ' + (props.noColor ? '' : 'text-zinc-800 dark:text-white');
      break;
    case 'info':
      defaultClassName =
        'text-sm font-normal' +
        ' ' +
        (props.noColor ? '' : 'text-zinc-500 dark:text-white dark:opacity-50');
      break;
    case 'info-small':
      defaultClassName =
        'text-xs font-normal' +
        ' ' +
        (props.noColor ? '' : 'text-zinc-500 dark:text-white dark:opacity-50');
      break;
  }

  return (
    <span
      className={defaultClassName + ' ' + (props.className || '')}
      {..._.omit(props, 'type', 'className', 'children', 'noColor')}
    >
      {props.children}
    </span>
  );
};

export default Text;
