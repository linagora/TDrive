/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import DraggableManager from './draggable-manager.js';
import Number from 'app/features/global/utils/Numbers';
import './draggable.scss';

export default class DroppableZone extends Component {
  constructor() {
    super();
    this.unique_drop_key = Number.unid();
    this.longOverTimeout = '';
  }
  onDrop(data) {
    if (!data) {
      return;
    }
    if (this.props.types && data.type) {
      if (this.props.types.indexOf(data.type) < 0) {
        return;
      }
    }
    if (this.props.onDrop) {
      this.props.onDrop(data);
    }
  }
  componentWillUnmount() {
    DraggableManager.removeDropCallback(this.unique_drop_key);
    clearTimeout(this.longOverTimeout);
  }
  onEnter() {
    if (DraggableManager.drag) {
      this.longOverTimeout = setTimeout(() => {
        if (DraggableManager.drag) {
          if (this.props.onClick && !this.props.disableLongOver) {
            this.props.onClick();
          }
          if (this.props.onLongOver) {
            this.props.onLongOver();
          }
        }
      }, 1500);
      DraggableManager.setDropCallback(this.unique_drop_key, d => this.onDrop(d));
    }
  }
  onLeave() {
    DraggableManager.removeDropCallback(this.unique_drop_key);
    clearTimeout(this.longOverTimeout);
  }
  render() {
    return (
      <div
        className={this.props.className}
        style={this.props.style}
        onClick={this.props.onClick}
        onMouseEnter={() => {
          if (!this.props.deactivated) {
            this.onEnter();
          }
        }}
        onMouseLeave={() => {
          if (!this.props.deactivated) {
            this.onLeave();
          }
        }}
      >
        {this.props.children}
        {!this.props.children && !this.props.deactivated && (
          <div className="empty">{this.props.empty || ''}</div>
        )}
      </div>
    );
  }
}
