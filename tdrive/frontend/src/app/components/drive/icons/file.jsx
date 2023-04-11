/* eslint-disable react/prop-types */
import React from 'react';

const SvgComponent = props => (
  <svg
    width={(props.scale || 1) * 0.75 * 32}
    height={(props.scale || 1) * 0.75 * 32}
    viewBox="0 0 100 100"
    {...props}
  >
    <path
      scale={(props.scale || 1) * 0.75}
      fill={props.fill || '#FFF'}
      d="M60 0H20C13.373 0 8 5.373 8 12v72c0 6.627 5.373 12 12 12h55.875C82.502 96 88 90.627 88 84V28L60 0zm0 11.178L76.709 28H60V11.178zM75.875 88H20c-2.206 0-4-1.794-4-4V12c0-2.206 1.794-4 4-4h32v28h28v48c0 2.168-1.889 4-4.125 4z"
    />
  </svg>
);

export default SvgComponent;
