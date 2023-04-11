import React, { Component } from 'react';

import DraggableManager from './draggable-manager.js';

export default class DraggableBodyLayer extends Component {
  constructor() {
    super();
    this.state = {
      draggable_manager: DraggableManager,
    };
    this.draggable_body_dom = null;
    DraggableManager.addListener(this);
  }
  componentDidMount() {
    DraggableManager.registerContainer(this.draggable_body_dom);
  }
  componentWillUnmount() {
    DraggableManager.removeListener(this);
  }
  render() {
    return <div ref={node => (this.draggable_body_dom = node)} />;
  }
}
