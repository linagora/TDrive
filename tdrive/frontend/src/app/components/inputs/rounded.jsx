/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import PlusIcon from '@material-ui/icons/AddOutlined';

export default class Rounded extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div
        style={this.props.style}
        className={'rounded-btn ' + this.props.className}
        onClick={this.props.onClick}
      >
        {this.props.text ? this.props.text + ' ' : ''}
        <PlusIcon className="m-icon-small" />
      </div>
    );
  }
}
