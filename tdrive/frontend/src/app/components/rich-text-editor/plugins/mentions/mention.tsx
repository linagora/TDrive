import React, { ReactNode } from 'react';

type PropsType = {
  children: ReactNode
}

export const Mention = (props: PropsType): JSX.Element => {
  return <span className="label suggestion mention">{props.children}</span>;
};
