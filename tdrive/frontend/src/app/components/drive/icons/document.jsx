/* eslint-disable react/prop-types */
import React from 'react';

const SvgComponent = props => (
  <svg
    width={(props.scale || 1) * 0.75 * 32}
    height={(props.scale || 1) * 0.75 * 32}
    viewBox="0 0 32 32"
    {...props}
  >
    <g fill={props.fill || '#FFF'}>
      <path
        scale={(props.scale || 1) * 0.75}
        d="M29.159 6.189H2.839a1.34 1.34 0 0 1 0-2.679h26.32a1.34 1.34 0 1 1 0 2.679zM29.159 13.592H2.839a1.34 1.34 0 0 1 0-2.68h26.32a1.34 1.34 0 0 1 0 2.68zM29.159 20.995H2.839a1.34 1.34 0 0 1 0-2.678h26.32a1.34 1.34 0 1 1 0 2.678zM18.685 28.403H2.839c-.739 0-1.339-.598-1.339-1.338s.601-1.341 1.339-1.341h15.845c.74 0 1.34.601 1.34 1.341s-.599 1.338-1.339 1.338z"
      />
    </g>
  </svg>
);

export default SvgComponent;
