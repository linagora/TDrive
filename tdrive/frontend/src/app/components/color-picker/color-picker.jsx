/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import React, { Component } from 'react';
import './color-picker.scss';
import CheckIcon from '@material-ui/icons/CheckOutlined';

export default class ColorPicker extends Component {
  static colors = [
    '#D50000',
    '#E67C73',
    '#F4511E',
    '#F6BF26',
    '#33B679',
    '#0B8043',
    '#039BE5',
    '#3F51B5',
    '#7986CB',
    '#8E24AA',
    '#801515',
    '#616161',
  ];

  /*
        props = {
            value : default color
            onChange : called when a color is selected
        }
    */
  constructor() {
    super();
    this.colors = ColorPicker.colors;
  }
  render() {
    var showed_selected = this.colors.indexOf(this.props.value) >= 0;
    var colors = this.colors;
    if (!showed_selected) {
      colors = this.colors.concat([this.props.value]);
    }
    return (
      <div className="colorPicker" ref={this.props.refDom}>
        {colors.map(color => {
          return (
            <div
              className="color"
              style={{ backgroundColor: color }}
              onClick={() => this.props.onChange(color)}
            >
              {this.props.value == color && <CheckIcon className="m-icon-small" />}
            </div>
          );
        })}
      </div>
    );
  }
}
