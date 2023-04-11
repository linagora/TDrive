/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import BaseBlock from '@molecules/grouped-rows/base';

// @ts-ignore
interface BlockProps extends React.InputHTMLAttributes<HTMLInputElement> {
  avatar: JSX.Element;
  title: JSX.Element | string;
  subtitle: JSX.Element | string;
  date?: JSX.Element | string;
  suffix?: JSX.Element | string;
  className?: string;
}

export default function Workspace(props: BlockProps) {
  return BaseBlock({
    avatar: props.avatar,
    title: props.title,
    subtitle: props.subtitle,
    title_suffix: props.date,
    subtitle_suffix: props.suffix,
    className: props.className,
  });
}
