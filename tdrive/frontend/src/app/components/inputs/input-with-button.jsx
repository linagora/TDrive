/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import './input-with-button.scss';
import Icon from 'app/components/icon/icon.jsx';
import Input from './input.jsx';

export default class InputWithButton extends Component {
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

  render() {
    return (
      <div className="inputWithButton">
        <Input
          className="medium full_width"
          refInput={obj => {
            this.inputElement = obj;
            this.props.refInput && this.props.refInput();
          }}
          {...this.props}
        />
        {!this.props.hideBtn && (
          <div
            className={'button button-icon ' + (this.props.color ? this.props.color : '')}
            onClick={() => this.props.btnAction()}
          >
            <Icon type={this.props.icon} />
          </div>
        )}
      </div>
    );
  }
}
