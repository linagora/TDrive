import React, { Component } from 'react';

import MenusManager from 'app/components/menus/menus-manager.jsx';

/*
  One menu
*/
export default class Menu extends React.Component {
  /*
      props = {
          menu : menu object ex. {type:"menu", text:"Un menu", icon:"list"},
          {type:"menu", text:"Un menu avec sous menu", icon:"grid", submenu: [
            {text:"Sub menu 4", icon: "search"},
            {text:"Sub menu 5", icon: "search"},
            {text:"Sub menu 6", icon: "search"}
          ]},
          {type:"menu", text:"Un menu avec sous menu", icon:"grid", submenu: [
              {type:"react-element", text:"Sub menu 6", icon: "search", reactElement:<div className="hello">salut</div>}
          ]},
          {type:"separator"},
          {type:"text", text:"Du texte"}
          {type:"react-element", reactElement: <Element />}
      }
  */

  static closeAll() {
    MenusManager.closeMenu();
  }

  constructor(props) {
    super();
    this.state = {
      menus_manager: MenusManager,
    };
    MenusManager.addListener(this);
  }
  componentWillUnmount() {
    if (this.props.onClose && this.open) {
      this.props.onClose();
    }
    MenusManager.removeListener(this);
  }
  openMenuFromParent(menu, rect, position) {
    MenusManager.openMenu(menu, rect, position);
  }
  openMenu(evt) {
    this.open = true;
    evt.preventDefault();
    evt.stopPropagation();
    var elementRect = window.getBoundingClientRect(this.container);
    elementRect.x = elementRect.x || elementRect.left;
    elementRect.y = elementRect.y || elementRect.top;
    this.previous_menus_id = MenusManager.openMenu(
      this.props.menu,
      elementRect,
      this.props.position,
    );
    if (this.props.onOpen) this.props.onOpen();
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.menu != this.props.menu && this.open) {
      this.setState({});
    }

    if (
      (this.state.menus_manager.menus.length == 0 && this.previous_menus_number > 0) ||
      this.state.menus_manager.last_opened_id != this.previous_menus_id
    ) {
      if (this.open && this.props.onClose) {
        this.props.onClose();
      }
      this.open = false;
    }
    if (this.previous_menus_number != this.state.menus_manager.menus.length) {
      this.previous_menus_number = this.state.menus_manager.menus.length;
    }

    if (this.props.style !== nextProps.style || this.props.className !== nextProps.className) {
      return true;
    }

    return false;
  }
  render() {
    return (
      <div
        ref={node => (this.container = node)}
        style={this.props.style}
        onClick={evt => {
          if (this.props.toggle) {
            if (!this.open) {
              this.openMenu(evt);
            } else {
              MenusManager.closeMenu();
              this.props.onClose && this.props.onClose();
            }
          } else {
            this.openMenu(evt);
          }
        }}
        className={this.props.className}
      >
        {this.props.children}
      </div>
    );
  }
}
