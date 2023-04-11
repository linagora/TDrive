/* eslint-disable react/prop-types */
import React from 'react';

const SvgComponent = props => (
  <svg
    width={(props.scale || 1) * 0.75 * 32}
    height={(props.scale || 1) * 0.75 * 32}
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      scale={(props.scale || 1) * 0.75}
      fill={props.fill || '#FFF'}
      d="M18.802 3.5H16.67v17.38c-1.181-.449-2.707-.457-4.211.09-2.697.979-4.306 3.369-3.591 5.33.715 1.967 3.481 2.76 6.179 1.777 2.291-.832 3.791-2.68 3.75-4.422l.005-14.214c3.722.586 3.973 5.289 3.531 6.607-.171.5.126.873.688 0C27.032 9.81 18.802 7.057 18.802 3.5z"
    />
  </svg>
);

export default SvgComponent;
