import _ from 'lodash';
import { defaultInputClassName, errorInputClassName } from './input-text';

interface InputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  theme?: 'plain' | 'outline';
  hasError?: boolean;
  size?: 'md' | 'lg' | 'sm';
  className?: string;
  children?: React.ReactNode;
}

export function Select(props: InputProps) {
  let inputClassName = props.hasError
    ? errorInputClassName(props.theme)
    : defaultInputClassName(props.theme);
  inputClassName = inputClassName + (props.disabled ? ' opacity-75' : '');

  if (props.size === 'lg') inputClassName = inputClassName + ' text-lg h-11';
  else if (props.size === 'sm') inputClassName = inputClassName + ' text-sm h-7 py-0 px-3';
  else inputClassName = inputClassName + ' text-base h-9 py-1';

  return (
    <select
      className={inputClassName + ' ' + props.className}
      {..._.omit(props, 'label', 'className', 'size')}
    >
      {props.children}
    </select>
  );
}

export default Select;
