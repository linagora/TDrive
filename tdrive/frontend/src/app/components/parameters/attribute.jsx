import React, { Component } from 'react';

import Number from 'app/features/global/utils/Numbers';
import AttributesManager from './attributes-manager.js';
import './parameters.scss';
import Languages from 'app/features/global/services/languages-service';

export default class Attribute extends React.Component {
  constructor(props) {
    super();

    this.id = Number.unid();

    this.state = {
      parameters_attributes: AttributesManager,
      i18n: Languages,
    };

    this.timeout = setTimeout('');

    Languages.addListener(this);
    AttributesManager.addListener(this);
  }
  componentDidMount() {
    if (this.props.autoOpen) {
      AttributesManager.toggle(this.id);
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
    Languages.removeListener(this);
    AttributesManager.removeListener(this);
  }
  componentDidUpdate() {
    var open = this.state.parameters_attributes.open == this.id;
    if (open && !this.was_open) {
      this.value_node.style.maxHeight = 'none';
      this.value_height = window.getBoundingClientRect(this.value_node).height;
      this.value_node.style.maxHeight = '0px';
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.value_node.style.maxHeight = this.value_height + 'px';

        this.timeout = setTimeout(() => {
          this.value_node.style.maxHeight = 'none';
          this.value_height = window.getBoundingClientRect(this.value_node).height;
        }, 200);
      }, 50);

      if (this.props.focusOnOpen) {
        this.props.focusOnOpen.focus();
      }
    } else if (!open && this.was_open) {
      clearTimeout(this.timeout);

      this.value_node.style.maxHeight = this.value_height + 'px';
      this.timeout = setTimeout(() => {
        this.value_node.style.maxHeight = '0px';
      }, 50);
    }
    this.was_open = open;
  }
  render() {
    return (
      <div
        className={
          'parameters_attribute ' + (this.state.parameters_attributes.open == this.id ? 'open' : '')
        }
      >
        <div className="label" onClick={() => AttributesManager.toggle(this.id)}>
          {!this.props.autoOpen && (
            <a href="#" className="modify">
              {this.state.parameters_attributes.open == this.id
                ? this.state.i18n.t('general.close')
                : this.state.i18n.t('general.open')}
            </a>
          )}
          <div className="label">{this.props.label}</div>
          <div className="description">{this.props.description}</div>
        </div>
        <div ref={node => (this.value_node = node)} className="value">
          {this.props.children}
        </div>
      </div>
    );
  }
}
