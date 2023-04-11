/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import './animation.scss';
import './unicons.scss';

export default class Icon extends Component {
  /*
      props = {
          type : icon name
      }
  */
  constructor() {
    super();
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.type != this.props.type || nextProps.className != this.props.className) {
      return true;
    }
    return false;
  }
  render() {
    if ((this.props.type || '').indexOf('http') === 0) {
      return (
        <div
          className="app_icon"
          style={{
            backgroundImage: 'url(' + (this.props.type || '') + ')',
          }}
        />
      );
    } else {
      return (
        <i
          ref={this.props.refDom}
          className={'icon-unicon uil-' + this.props.type + ' ' + this.props.className}
          onClick={this.props.onClick}
          style={this.props.style}
        />
      );
    }
  }
}
