/* eslint-disable react/prop-types */
import React from 'react';
import './buttons.scss';

export default class Button extends React.Component {
  render() {
    var className = this.props.className || '';

    if (this.props.big) {
      className += ' big ';
    }
    if (this.props.medium) {
      className += ' medium ';
    }
    if (this.props.small) {
      className += ' small ';
    }

    if (
      className.indexOf('medium') === className.indexOf('small') &&
      className.indexOf('big') === className.indexOf('small') &&
      className.indexOf('big') < 0
    ) {
      className += ' small';
    }
    return (
      <button
        ref={this.props.refButton}
        {...this.props}
        className={'button no-tw ' + className}
        onClick={evt => {
          evt.target.blur();
          this.props.onClick && this.props.onClick(evt);
        }}
      >
        {this.props.value || this.props.children}
      </button>
    );
  }
}
