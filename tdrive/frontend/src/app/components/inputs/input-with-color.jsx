/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import MenusManager from 'app/components/menus/menus-manager.jsx';
import ColorPicker from 'components/color-picker/color-picker.jsx';
import Input from 'components/inputs/input.jsx';
import './inputs.scss';

export default class InputWithColor extends Component {
  constructor() {
    super();
  }
  outsideMenuListener() {
    this.closeColorPicker();
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.outsideClickListener);
  }
  componentDidMount() {
    if (this.props.focusOnDidMount && this.input) {
      this.input.focus();
    }
    this.outsideClickListener = event => {
      if (
        this.colorPickerIsOpen &&
        this.colorpicker_dom &&
        !this.colorpicker_dom.contains(event.target) &&
        document.contains(event.target)
      ) {
        this.outsideMenuListener();
      }
    };
    this.outsideClickListener = this.outsideClickListener.bind(this);
    document.addEventListener('click', this.outsideClickListener);
  }
  closeColorPicker() {
    if (!this.colorPickerIsOpen) {
      return;
    }

    if (this.props.menu_level !== undefined) {
      MenusManager.closeSubMenu(this.props.menu_level);
    } else {
      MenusManager.closeMenu();
    }

    this.colorPickerIsOpen = false;
  }
  openColorPicker() {
    if (this.colorPickerIsOpen) {
      return;
    }

    var menu = [
      {
        type: 'react-element',
        reactElement: () => {
          return (
            <ColorPicker
              refDom={node => (this.colorpicker_dom = node)}
              value={this.props.value[0]}
              onChange={color => this.selectColor(color)}
            />
          );
        },
      },
    ];
    var elementRect = window.getBoundingClientRect(this.color_dom);
    elementRect.x = elementRect.x || elementRect.left;
    elementRect.y = elementRect.y || elementRect.top;
    if (this.props.menu_level !== undefined) {
      MenusManager.openSubMenu(menu, elementRect, this.props.menu_level, 'bottom');
    } else {
      MenusManager.openMenu(menu, elementRect, 'bottom');
    }

    setTimeout(() => {
      this.colorPickerIsOpen = true;
    }, 200);
  }
  selectColor(color) {
    this.closeColorPicker();
    var value = [color, this.props.value[1]];
    this.onChange(value);
  }
  onChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  render() {
    if (!this.props.value[0]) {
      this.onChange([
        ColorPicker.colors[parseInt(Math.random() * ColorPicker.colors.length)],
        this.props.value[1],
      ]);
    }
    return (
      <div className={'input_with_color ' + this.props.className}>
        <div
          className="color"
          ref={node => (this.color_dom = node)}
          onClick={() => {
            this.openColorPicker();
          }}
        >
          <div className="acolor" style={{ backgroundColor: this.props.value[0] }} />
        </div>
        <div className="right_input">
          <Input
            className="full_width medium"
            refInput={obj => (this.input = obj)}
            type="text"
            placeholder={this.props.placeholder}
            value={this.props.value[1]}
            onKeyDown={e => {
              if (e.keyCode == 13 && this.props.onEnter) {
                this.props.onEnter();
              }
            }}
            onChange={evt => {
              if (this.onChange) this.onChange([this.props.value[0], evt.target.value]);
            }}
          />
        </div>
      </div>
    );
  }
}
