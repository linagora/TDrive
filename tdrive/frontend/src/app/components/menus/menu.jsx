import React from 'react';
import MenusManager from '@components/menus/menus-manager.jsx';

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
    MenusManager.closeAllMenus(); // Corrected method name to closeAllMenus()
  }

  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
    };
    this.open = false; // Added initialization for open state
    this.container = React.createRef(); // Ref for container div
    this.previousMenusId = null; // Added initialization for previousMenusId
  }

  componentDidMount() {
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
    if (this.open) {
      this.closeAll();
    } else {
      this.open = true;
      evt.preventDefault();
      evt.stopPropagation();
      var elementRect = this.container.current.getBoundingClientRect(); // Fixed getBoundingClientRect()
      elementRect.x = elementRect.x || elementRect.left;
      elementRect.y = elementRect.y || elementRect.top;
      this.previousMenusId = MenusManager.openMenu( // Updated variable name
        this.props.menu,
        elementRect,
        this.props.position,
      );
      if (this.props.onOpen) this.props.onOpen();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.menu !== this.props.menu && this.open) { // Fixed comparison operator
      this.setState({});
    }

    if (
      (MenusManager.menus.length === 0 && this.previousMenusNumber > 0) ||
      MenusManager.lastOpenedId !== this.previousMenusId // Updated variable name
    ) {
      if (this.open && this.props.onClose) {
        this.props.onClose();
      }
      this.open = false;
    }
    if (this.previousMenusNumber !== MenusManager.menus.length) {
      this.previousMenusNumber = MenusManager.menus.length;
    }

    if (
      this.props.style !== nextProps.style ||
      this.props.className !== nextProps.className
    ) {
      return true;
    }

    return false;
  }

  render() {
    return (
      <div
        ref={this.container}
        style={this.props.style}
        onClick={(evt) => {
          console.log('if this open: ', this.state.isMenuOpen);
          if (this.props.toggle) {
            if (!this.open) {
              this.setState({ ...this.state, isMenuOpen: true });
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
