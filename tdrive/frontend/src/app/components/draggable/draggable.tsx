/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React from 'react';
import './draggable.scss';
import DraggableManager from './draggable-manager.js';
import classNames from 'classnames';

type PropsType = { [key: string]: any };

type StateType = { [key: string]: any };

export default class Draggable extends React.Component<PropsType, StateType> {
  node: HTMLDivElement | null | undefined;

  render() {
    return (
      <div
        className={classNames(
          { draggable: !this.props?.deactivated, dragging_opacity: this.state?.hide_original },
          this.props.className,
        )}
        ref={node => {
          this.node = node;
          if (this.props.refDraggable) {
            this.props.refDraggable(node);
          }
        }}
        onClick={this.props.onClick}
        onMouseDown={evt => {
          !this.props?.deactivated && DraggableManager.start(evt, this.node, this);
        }}
        onMouseUp={evt => {
          !this.props?.deactivated && DraggableManager.end(evt, this.node, this);
        }}
        onMouseOver={this.props.onMouseOver}
        onMouseOut={this.props.onMouseOut}
        onDoubleClick={this.props.onDoubleClick}
      >
        {this.props.children}
      </div>
    );
  }
}
