import React, { Component } from 'react';

import './tooltip.scss';

export default class Tooltip extends Component {
  /*
        props = {
            tooltip : text or react element to show
            visible :
            overable :  default : true
            position :
        }
    */
  constructor(props) {
    super(props);
    this.state = {
      top: 'unset',
      left: 'unset',
      right: 'unset',
      bottom: '0px',
    };
  }
  componentWillUnmount() {}
  componentDidUpdate(prevProps, prevState) {
    if (this.props.visible === true && prevProps.visible === false) {
      this.open();
    } else if (this.props.visible === false && prevProps.visible === true) {
      this.close();
    }
  }
  openWithTimeOut(timeout = 5) {
    var that = this;
    that.open();
    setTimeout(() => {
      that.close();
    }, timeout * 1000);
  }
  open() {
    if (this.props.position === 'left') {
      this.setState({
        visible: true,
        left: (this.tooltip.clientWidth + 8) * -1 + 'px',
        right: 'unset',
      });
    } else if (this.props.position === 'right') {
      this.setState({
        visible: true,
        right: (this.tooltip.clientWidth + 8) * -1 + 'px',
        left: 'unset',
      });
    } else if (this.props.position === 'bottom') {
      this.setState({
        visible: true,
        bottom: (this.tooltip.clientHeight + 5) * -1 + 'px',
        top: 'unset',
      });
    } else {
      this.setState({
        visible: true,
        top: (this.tooltip.clientHeight + 5) * -1 + 'px',
        bottom: 'unset',
      });
    }
  }
  close() {
    this.setState({ visible: false, top: 'unset', left: '0px', right: 'unset', bottom: '0px' });
  }
  componentDidMount() {
    var that = this;
    if (this.parent && this.children) {
      window.tooltip = this.tooltip;
      this.parent.addEventListener('mouseenter', () => {
        if (this.props.overable !== false) {
          that.open();
        }
      });
      this.parent.addEventListener('mouseleave', () => {
        if (this.props.overable !== false) {
          that.close();
        }
      });
    }
  }
  render() {
    return (
      <div
        className={'tooltip ' + (this.props.className || '')}
        ref={parent => (this.parent = parent)}
      >
        <div
          style={{
            top: this.state.top,
            left: this.state.left,
            bottom: this.state.bottom,
            right: this.state.right,
          }}
          className={
            'tooltipAbsolute ' +
            (this.state.visible ? 'visible' : '') +
            ' ' +
            (this.props.position ? this.props.position : 'top')
          }
          ref={obj => (this.tooltip = obj)}
        >
          {this.props.tooltip}
        </div>
        <div className="contentTooltip" ref={children => (this.children = children)}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
