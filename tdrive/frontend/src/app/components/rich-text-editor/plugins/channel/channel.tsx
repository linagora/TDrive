import React, { ReactNode } from "react";

type PropsType = {
  children: ReactNode
}

export const Channel = (props: PropsType) => {
  return <span className="label suggestion">{props.children}</span>;
};
