/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash';

export default function Avatar(
  props: any & {
    avatar: string;
    size: 28 | 14 | 48;
  },
) {
  const size = props.size || 14;
  const className =
    ' inline-block h-' +
    size +
    ' w-' +
    size +
    ' rounded-full overflow-hidden bg-zinc-200 ' +
    (props.className || '');

  if (props.avatar || props.src) {
    return (
      <div
        className={className}
        {..._.omit(props, 'avatar', 'className', 'src')}
        style={{
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundImage: 'url(' + (props.avatar || props.src) + ')',
        }}
      />
    );
  }

  return (
    <span className={className} {..._.omit(props, 'avatar', 'className', 'src')}>
      <svg
        className="h-full w-full text-zinc-400 bg-zinc-200"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </span>
  );
}
