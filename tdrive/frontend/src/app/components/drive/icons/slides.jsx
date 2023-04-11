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
      <path scale={(props.scale || 1) * 0.75} d="M1.479 4.082h29.043V20.42H1.479z" />
      <path
        scale={(props.scale || 1) * 0.75}
        d="M30.521 21.898H1.479A1.479 1.479 0 0 1 0 20.42V4.082a1.48 1.48 0 0 1 1.479-1.479h29.043c.816 0 1.478.662 1.478 1.479V20.42c0 .816-.662 1.478-1.479 1.478zM2.957 18.941h26.086V5.56H2.957v13.381z"
      />
      <path
        scale={(props.scale || 1) * 0.75}
        d="M19.747 30.074c-.56 0-1.097-.32-1.345-.863l-2.513-5.484-3.019 5.572a1.478 1.478 0 1 1-2.6-1.408l4.429-8.176a1.466 1.466 0 0 1 1.349-.772c.56.019 1.062.353 1.294.862l3.746 8.174a1.48 1.48 0 0 1-1.341 2.095z"
      />
    </g>
  </svg>
);

export default SvgComponent;
