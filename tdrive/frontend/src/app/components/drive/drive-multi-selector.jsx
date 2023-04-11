/* eslint-disable react/prop-types */
/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';

import './drive-multi-selector.scss';
import SelectionsManager from 'app/deprecated/SelectionsManager/SelectionsManager.js';
import './drive.scss';

export default class DriveMultiSelector extends Component {
  constructor() {
    super();
    this.state = {
      start_drag: false,
      dragging: true,
    };
    this.move = this.move.bind(this);
    this.end = this.end.bind(this);
    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
    this.unpause = this.unpause.bind(this);

    this.currentSelection = {};
    this.currentSelectionCount = 0;

    this.noMovementRefreshAnyway = setTimeout('');
  }
  componentDidMount() {
    this.scroller_container = this.props.scroller;
  }
  componentWillUnmount() {
    clearInterval(this.noMovementRefreshAnyway);

    this.container.removeEventListener('mouseleave', this.pause);
    this.container.removeEventListener('mouseenter', this.unpause);
    document.removeEventListener('mousemove', this.move);
    document.removeEventListener('mouseup', this.end);
    document.body.classList.remove('no_select');
  }
  pause() {
    clearInterval(this.noMovementRefreshAnyway);

    this.setState({ dragging: false });
  }
  unpause() {
    this.setState({ dragging: true });
  }
  end(evt) {
    clearInterval(this.noMovementRefreshAnyway);

    this.setState({ start_drag: false });

    document.removeEventListener('mousemove', this.move);
    document.removeEventListener('mouseup', this.end);
    this.container.removeEventListener('mouseleave', this.pause);
    this.container.removeEventListener('mouseenter', this.unpause);

    document.body.classList.remove('no_select');

    if (!this.did_drag) {
      if (!evt.shiftKey && !this.did_start_drag == 0) {
        SelectionsManager.unselectAll();
      }
      this.did_start_drag = false;
      return;
    }
    this.did_drag = false;

    Object.keys(this.currentSelection).forEach(id => {
      if (this.currentSelection[id]) {
        SelectionsManager.select(id);
      } else {
        SelectionsManager.unselect(id);
      }
    });
    this.did_start_drag = false;

    this.noMovementRefreshAnyway = setTimeout(() => {
      this.state.left = 0;
      this.state.right = 0;
      this.state.width = 0;
      this.state.height = 0;
      this.setState({});
    }, 500);
  }
  start(evt) {
    this.did_drag = false;
    this.did_start_drag = true;

    this.element_position_cache = {};

    SelectionsManager.setType(this.props.selectionType);

    clearInterval(this.noMovementRefreshAnyway);
    this.currentSelection = {};

    this.state.start_drag = true;
    this.state.dragging = true;
    var rect = window.getBoundingClientRect(this.container);
    rect.x = rect.x || rect.left;
    rect.y = rect.y || rect.top;

    this.drag_add = evt.nativeEvent.shiftKey;
    this.drag_start = [
      evt.clientX - rect.left,
      evt.clientY - rect.top,
      this.container.scrollLeft,
      this.container.scrollTop,
    ];

    document.addEventListener('mousemove', this.move);
    document.addEventListener('mouseup', this.end);
    this.container.addEventListener('mouseleave', this.pause);
    this.container.addEventListener('mouseenter', this.unpause);

    document.body.classList.add('no_select');

    rect = {};
    rect.width = 0;
    rect.height = 0;
    rect.left = evt.clientX;
    rect.top = evt.clientY;
    this.autoSelect(rect);
  }
  move(evt) {
    clearInterval(this.noMovementRefreshAnyway);
    var rect = window.getBoundingClientRect(this.container);
    rect.x = rect.x || rect.left;
    rect.y = rect.y || rect.top;
    var pos = [];

    if (this.state.start_drag && this.state.dragging) {
      this.did_drag = true;

      pos = [evt.clientX - rect.left, evt.clientY - rect.top];

      pos[0] = Math.min(pos[0], rect.width - 5);
      pos[0] = Math.max(pos[0], 5);

      pos[1] = Math.min(pos[1], rect.height - 5);
      pos[1] = Math.max(pos[1], 5);

      var w = this.drag_start[0] + this.drag_start[2] - (pos[0] + this.container.scrollLeft);
      var h = this.drag_start[1] + this.drag_start[3] - (pos[1] + this.container.scrollTop);
      var winv = w > 0;
      var hinv = h > 0;
      var selectorRect = {
        width: Math.abs(w),
        height: Math.abs(h),
        left: this.drag_start[0] + this.drag_start[2] - Math.abs(winv ? w : 0),
        top: this.drag_start[1] + this.drag_start[3] - Math.abs(hinv ? h : 0),
      };
      this.setState(selectorRect);

      rect = window.getBoundingClientRect(this.selector);
      rect.x = rect.x || rect.left;
      rect.y = rect.y || rect.top;
      this.autoSelect(rect);
    }

    pos = [evt.clientX, evt.clientY];

    if (
      rect.height + rect.top < pos[1] ||
      rect.top > pos[1] ||
      rect.width + rect.left < pos[0] ||
      rect.left > pos[0]
    ) {
      var newScrollTop =
        this.container.scrollTop +
        (pos[1] - ((pos[1] > rect.height + rect.top ? rect.height : 0) + rect.top)) / 10;
      var newScrollLeft =
        this.container.scrollLeft +
        (pos[0] - ((pos[0] > rect.width + rect.top ? rect.width : 0) + rect.left)) / 10;

      if (this.container.scrollTop != newScrollTop || this.container.scrollLeft != newScrollLeft) {
        this.container.scrollTop = newScrollTop;
        this.container.scrollLeft = newScrollLeft;
        this.state.dragging = true;

        this.noMovementRefreshAnyway = setTimeout(() => {
          this.move({
            clientX: evt.clientX,
            clientY: evt.clientY,
          });
        }, 50);
      } else {
        this.state.dragging = false;
      }
    }
  }
  autoSelect(rect) {
    this.currentSelectionCount = 0;
    var scroll_top = this.container.scrollTop;
    if (this.old_scroll_top != scroll_top) {
      this.element_position_cache = {};
    }
    this.old_scroll_top = scroll_top;

    Array.from(this.container.getElementsByClassName('js-drive-multi-selector-selectable')).forEach(
      element => {
        var element_id = element.getAttribute('drive_selector_unid');

        var selected = SelectionsManager.selected_per_type[this.props.selectionType][element_id];

        var over = false;
        var elementRect = {};

        if (this.element_position_cache[element_id]) {
          elementRect = JSON.parse(JSON.stringify(this.element_position_cache[element_id]));
        } else {
          var er = window.getBoundingClientRect(element);
          er.x = er.x || er.left;
          er.y = er.y || er.top;
          elementRect = JSON.parse(JSON.stringify(er));
          this.element_position_cache[element_id] = elementRect;
        }

        if (
          !(
            rect.left > elementRect.left + elementRect.width ||
            elementRect.left > rect.left + rect.width ||
            rect.top > elementRect.top + elementRect.height ||
            elementRect.top > rect.top + rect.height
          )
        ) {
          over = true;
        }

        if (
          (over && this.drag_add && selected) ||
          (!over && this.drag_add && !selected) ||
          (!over && !this.drag_add)
        ) {
          element.dispatchEvent(new Event('drive_selector_out'));
          this.currentSelection[element_id] = false;
        }
        if (
          (over && this.drag_add && !selected) ||
          (over && !this.drag_add) ||
          (!over && this.drag_add && selected)
        ) {
          element.dispatchEvent(new Event('drive_selector_over'));
          this.currentSelection[element_id] = true;
          this.currentSelectionCount++;
        }
      },
    );
  }
  render() {
    return (
      <div
        onMouseDown={evt => {
          this.start(evt);
        }}
        onMouseUp={evt => {
          this.end(evt);
        }}
        ref={node => (this.container = node)}
        style={this.props.style || {}}
        className={'drive_multiselector'}
      >
        <div
          ref={node => (this.selector = node)}
          className={
            'selectionRect ' + (this.state.start_drag && this.state.dragging ? 'visible ' : '')
          }
          style={{
            width: this.state.width,
            height: this.state.height,
            left: this.state.left,
            top: this.state.top,
          }}
        />
        {this.props.children}
      </div>
    );
  }
}
