import React, { Component } from 'react';
import './inline-tag-picker.scss';

export default class InlineTagPicker extends Component {
  render() {
    return this.props.available.map(item => {
      return (
        <div
          key={item}
          className={
            'inline-tag small-top-margin ' + (this.props.value.includes(item) ? 'selected' : '')
          }
          onClick={() => {
            let array = (this.props.value || []).map(a => a);
            if (this.props.value.includes(item)) {
              array = this.props.value.filter(val => item !== val);
            } else {
              array.push(item);
            }
            this.props.onChange(array);
          }}
        >
          {item}
        </div>
      );
    });
  }
}
