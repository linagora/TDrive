/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import Tooltip from 'components/tooltip/tooltip.jsx';
import InputWithButton from 'components/inputs/input-with-button.jsx';

export default class InputWithClipBoard extends Component {
  /*
        props = {
            value : "",
            disabled : true|false
        }
    */
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      i18n: Languages,
    };

    Languages.addListener(this);
    this.inputElement = false;
  }
  componentWillUnmount() {
    Languages.removeListener(this);
  }
  selectAll() {
    this.inputElement.focus();
    this.inputElement.select();
  }
  copy() {
    this.inputElement.disabled = false;
    this.inputElement.focus();
    this.inputElement.select();
    document.execCommand('copy');
    this.inputElement.disabled = this.props.disabled;
    this.tooltip.openWithTimeOut(2);
  }
  render() {
    return (
      <Tooltip
        ref={obj => (this.tooltip = obj)}
        overable={false}
        tooltip={Languages.t('components.input.copied', [], 'Copié')}
      >
        <InputWithButton
          refInput={obj => (this.inputElement = obj)}
          btnAction={() => this.copy()}
          icon="copy"
          hideBtn={this.props.hideBtn}
          value={this.props.value}
          disabled={this.props.disabled}
        />
      </Tooltip>
    );
  }
}
