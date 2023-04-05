import _ from 'lodash';
import React from 'react';

interface PropsType extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'> {
  size?: 16 | 32 | 64 | 128 | 256;
}

export const Logo = (props: PropsType): React.ReactElement => {
  const { size = 128 } = props;

  return (
    <div
      className={'flex flex-col items-center justify-center ' + props.className}
      {..._.omit(props, 'className', 'size')}
    >
      <img
        className="mx-auto w-auto"
        src={`/public/img/logo/${size}x${size}.png`}
        alt="Tdrive logo"
      />
    </div>
  );
};
