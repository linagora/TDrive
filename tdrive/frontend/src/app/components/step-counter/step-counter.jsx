import React, { Component } from 'react';

import './step-counter.scss';

export default class StepCounter extends React.Component {
  /*
        props : {
            current : int
            total : int
        }
    */
  constructor() {
    super();
  }
  displayStep() {
    var ret = [];
    for (var i = 0; i < this.props.total; i++) {
      ret.push(
        <div
          key={'step-' + i}
          className={'step ' + (i <= this.props.current - 1 ? 'setSelected' : '')}
          style={{ flex: 1 / this.props.total }}
        />,
      );
    }
    return ret;
  }
  render() {
    return (
      <div className="stepCounter" style={{ maxWidth: this.props.total * 80 }}>
        {this.displayStep().map(item => {
          return item;
        })}
      </div>
    );
  }
}
