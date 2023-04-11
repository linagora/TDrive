import React, { Component } from 'react';

import MenusManager from 'app/components/menus/menus-manager.jsx';
import Icon from 'app/components/icon/icon.jsx';
import './select.scss';

export default class Select extends React.Component {
  constructor(props) {
    super();
    this.props = props;
  }
  select(value) {
    this.props.onChange(value);
  }
  openMenu(evt) {
    var pos = window.getBoundingClientRect(this.node);
    pos.x = pos.x || pos.left;
    pos.y = pos.y || pos.top;
    MenusManager.openMenu(
      this.props.options.map(item => {
        return {
          type: item.type || 'menu',
          text: item.text,
          className: item.className,
          icon: item.icon,
          emoji: item.emoji,
          reactElement: item.reactElement,
          onClick: () => this.select(item.value),
        };
      }),
      { x: pos.x + pos.width / 2, y: pos.y + pos.height },
      'bottom',
    );
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
      className += ' small';
    }

    var current =
      this.props.options.filter(item => {
        return item.value == this.props.value;
      })[0] || {};

    return (
      <div
        ref={node => (this.node = node)}
        className={'select ' + className}
        onClick={evt => this.openMenu(evt)}
      >
        {current.icon && <Icon type={current.icon} />} {current.text || current.title || '-'}
      </div>
    );
  }
}
