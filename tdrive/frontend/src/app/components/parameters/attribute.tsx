import { ReactNode } from 'react';
import './parameters.scss';

export default (props: { label: string; description: string; children: ReactNode }) => {
  return (
    <div className={'parameters_attribute open block'}>
      <div className="label">
        <div className="label">{props.label}</div>
        <div className="description">{props.description}</div>
      </div>
      <div className="value">{props.children}</div>
    </div>
  );
};
