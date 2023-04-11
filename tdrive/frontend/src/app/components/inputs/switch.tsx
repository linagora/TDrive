import React from 'react';
import { Switch } from 'antd';

import './inputs.scss';

export default (props: {
  big?: boolean;
  medium?: boolean;
  small?: boolean;
  loading?: boolean;
  className?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) => {
  const renderSwitch = () => {
    let className = props.className || '';

    if (props.big) {
      className += ' big ';
    }
    if (props.medium) {
      className += ' medium ';
    }
    if (props.small) {
      className += ' small ';
    }

    if (
      className.indexOf('medium') === className.indexOf('small') &&
      className.indexOf('big') === className.indexOf('small') &&
      className.indexOf('big') < 0
    ) {
      className += ' medium';
    }
    return (
      <Switch
        checked={props.checked}
        onChange={(value: boolean) => {
          props.onChange(value);
        }}
        className={className}
        loading={props.loading}
        disabled={props.disabled}
      />
    );
  };

  let parentClassName = '';

  if (props.big) {
    parentClassName += ' big ';
  }
  if (props.medium) {
    parentClassName += ' medium ';
  }
  if (props.small) {
    parentClassName += ' small ';
  }

  if (
    parentClassName.indexOf('medium') === parentClassName.indexOf('small') &&
    parentClassName.indexOf('big') === parentClassName.indexOf('small') &&
    parentClassName.indexOf('big') < 0
  ) {
    parentClassName += ' medium';
  }

  if (props.label) {
    return (
      <div
        className={
          'switch_with_label ' + (props.disabled ? 'disabled' : '') + ' ' + parentClassName
        }
      >
        {renderSwitch()}
        <div className="label">{props.label}</div>
      </div>
    );
  } else {
    return renderSwitch();
  }
};
