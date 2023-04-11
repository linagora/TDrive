/* eslint-disable react/prop-types */
import React from 'react';

const SvgComponent = props => (
  <svg
    width={(props.scale || 1) * 0.75 * 32}
    height={(props.scale || 1) * 0.75 * 32}
    {...props}
    viewBox="0 0 32 32"
  >
    <g fill={props.fill || '#FFF'}>
      <path
        scale={(props.scale || 1) * 0.75}
        d="M28.705 28.018H3.293A1.293 1.293 0 0 1 2 26.726V5.274c0-.713.58-1.292 1.293-1.292h25.412c.715 0 1.295.58 1.295 1.292v21.451c0 .715-.58 1.293-1.295 1.293zM4.587 25.431h22.827V6.569H4.587v18.862z"
      />
      <path
        scale={(props.scale || 1) * 0.75}
        d="M28.705 20.864H3.293a1.293 1.293 0 0 1 0-2.585h25.412a1.293 1.293 0 1 1 0 2.585zM28.705 13.723H3.293a1.295 1.295 0 0 1 0-2.588h25.412a1.294 1.294 0 1 1 0 2.588z"
      />
      <path
        scale={(props.scale || 1) * 0.75}
        d="M16 28.018a1.291 1.291 0 0 1-1.293-1.292V5.274a1.295 1.295 0 0 1 2.588 0v21.451c0 .715-.58 1.293-1.295 1.293z"
      />
    </g>
  </svg>
);

export default SvgComponent;
