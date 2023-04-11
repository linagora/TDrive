/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import AutoHeight from 'components/auto-height/auto-height.jsx';

import './inputs.scss';

export default class Input extends Component {
  constructor() {
    super();
  }
  onKeyDown(evt) {
    if (evt.keyCode == 13 && this.props.onEnter) {
      this.props.onEnter();
    }
    if (evt.keyCode == 27 && this.props.onEchap) {
      this.props.onEchap();
    }
  }
  componentDidMount() {
    if (this.props.autoFocus && this.node) {
      this.node.focus();
      this.node.setSelectionRange(0, Number.MAX_SAFE_INTEGER);
    }
  }
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
      className += ' medium';
    }

    if (this.props.autoHeight) {
      return (
        <AutoHeight
          refInput={node => {
            this.node = node;
            this.props.refInput && this.props.refInput(node);
          }}
          {...this.props}
          onKeyDown={evt => {
            if (this.props.onKeyDown) {
              this.props.onKeyDown(evt);
            }
            this.onKeyDown(evt);
          }}
          className={'input ' + (className || '')}
        />
      );
    }

    return (
      <input
        ref={node => {
          this.node = node;
          this.props.refInput && this.props.refInput(node);
        }}
        {...this.props}
        onKeyDown={evt => {
          if (this.props.onKeyDown) {
            this.props.onKeyDown(evt);
          }
          this.onKeyDown(evt);
        }}
        className={'input ' + (className || '')}
        onBlur={this.props.onBlur}
        onChange={this.props.onChange}
      />
    );
  }
}
