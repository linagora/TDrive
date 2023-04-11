import React, { Component } from 'react';

import Observable from 'app/deprecated/CollectionsV1/observable.js';
import SelectionsManager from 'app/deprecated/SelectionsManager/SelectionsManager.js';

class DraggableManager extends Observable {
  constructor() {
    super();
    this.setObservableName('draggable_manager');
    this.container = null;

    this.move = this.move.bind(this);
    this.end = this.end.bind(this);
    this.start = this.start.bind(this);

    this.drag = false;
    this.clone_created = false;
    this.drag_initial_point = [];
    this.current_node_initial_position = [];
  }

  registerContainer(container) {
    this.container = container;
  }

  setDropCallback(key, callback) {
    this.callback_key = key;
    this.callback = callback;
  }

  removeDropCallback(key) {
    if (this.callback_key == key) {
      this.callback = false;
      this.callback_key = null;
    }
  }

  start(evt, node, react_draggable) {
    if (this.dragging) {
      return;
    }

    if (react_draggable.props.dragHandler) {
      var onHandler = false;
      var handlers = node.getElementsByClassName(react_draggable.props.dragHandler);
      if (handlers.length > 0) {
        Array.from(handlers).forEach(item => {
          if (item == evt.target || item.contains(evt.target)) {
            onHandler = true;
          }
        });
      }

      if (!onHandler) {
        return;
      }
    }

    this.data = {};
    if (node) {
      this.current_node = node;
    }
    if (react_draggable) {
      this.current_react_draggable = react_draggable;
      this.props = {
        parentClassOnDrag: this.current_react_draggable.props.parentClassOnDrag,
        minMove: this.current_react_draggable.props.minMove,
      };
      this.data = this.current_react_draggable.props.data;
    }

    this.selected_number = 1;
    if (this.data.selection_type) {
      this.selected_number = SelectionsManager.selected_per_type[this.data.selection_type];
      if (this.selected_number) {
        this.selected_number = Object.keys(this.selected_number).length;
      }

      if (!this.selected_number) {
        this.selected_number = 1;
      }
    }

    evt.stopPropagation();
    evt.preventDefault();

    document.addEventListener('mousemove', this.move);
    document.addEventListener('mouseup', this.end);
    var rect = window.getBoundingClientRect(this.current_node);
    rect.x = rect.x || rect.left;
    rect.y = rect.y || rect.top;

    this.clone_created = false;
    this.drag_initial_point = [evt.clientX, evt.clientY];
    this.current_node_initial_position = [rect.left, rect.top, node.clientWidth, node.clientHeight];

    this.drag = true;
    if (this.current_react_draggable) this.current_react_draggable.setState({ drag: true });
  }
  end(evt, node, react_draggable) {
    if (this.dragging) {
      evt.preventDefault();
      evt.stopPropagation();
    }

    this.current_react_draggable && this.current_react_draggable.setState({ hide_original: false });

    if (!this.data) {
      return;
    }

    if (node) {
      this.current_node = node;
    }
    if (react_draggable) {
      this.current_react_draggable = react_draggable;
      this.props = {
        parentClassOnDrag: this.current_react_draggable.props.parentClassOnDrag,
        minMove: this.current_react_draggable.props.minMove,
      };
    }

    document.removeEventListener('mousemove', this.move);
    document.removeEventListener('mouseup', this.end);

    document.body.classList.remove('dragging');
    document.body.classList.remove('drag_' + this.data.type);
    this.drag = false;
    this.dragging = false;
    if (this.current_react_draggable)
      this.current_react_draggable.setState({ drag: false, dragging: false });

    var delete_delay = 0;
    if (this.callback) {
      this.callback(this.data);
    } else {
      if (this.clone) {
        this.clone.style.transition = 'transform 0.2s';
        this.clone.style.transform =
          'translateX(' +
          this.current_node_initial_position[0] +
          'px) translateY(' +
          this.current_node_initial_position[1] +
          'px)';
      }
      delete_delay = 200;
    }

    setTimeout(() => {
      if (this.clone) {
        try {
          this.container.removeChild(this.clone);
        } catch (e) {}
      }
      if (this.current_react_draggable)
        this.current_react_draggable.setState({ hide_original: false });
      if (this.props.parentClassOnDrag) {
        this.props.parentClassOnDrag.split(' ').forEach(c => {
          this.container.classList.remove(c);
        });
      }
    }, delete_delay);

    this.data = {};
  }
  move(evt) {
    if (!this.data) {
      return;
    }

    var deltaX = evt.clientX - this.drag_initial_point[0];
    var deltaY = evt.clientY - this.drag_initial_point[1];

    if (
      !this.clone_created &&
      Math.max(Math.abs(deltaX), Math.abs(deltaY)) < (this.props.minMove || 10)
    ) {
      return;
    }

    if (this.drag) {
      if (!this.clone_created) {
        var html = this.current_node.outerHTML;
        var div = document.createElement('div');
        div.classList.add('draggable_clone');
        div.innerHTML = html.trim();
        div.firstChild.classList.remove('dragging_opacity');
        div.firstChild.classList.remove('fade_in');
        div.firstChild.classList.remove('is_selected');

        div.style.width = this.current_node_initial_position[2] + 'px';
        div.style.height = this.current_node_initial_position[3] + 'px';

        this.clone = div;

        if (this.selected_number > 1) {
          var div_number = document.createElement('div');
          div_number.classList.add('draggable_number');
          div_number.innerHTML = this.selected_number;
          this.clone.appendChild(div_number);
        }

        this.container.appendChild(this.clone);
        this.clone_created = true;

        if (this.props.parentClassOnDrag) {
          this.props.parentClassOnDrag.split(' ').forEach(c => {
            this.container.classList.add(c);
          });
        }

        if (
          this.current_react_draggable &&
          this.current_react_draggable.props &&
          this.current_react_draggable.props.onDragStart
        ) {
          this.current_react_draggable.props.onDragStart(evt);
        }

        this.dragging = true;
        if (this.current_react_draggable)
          this.current_react_draggable.setState({ dragging: true, hide_original: true });
      }

      document.body.classList.add('dragging');
      document.body.classList.add('drag_' + this.data.type);
      this.clone.style.transform =
        'translateX(' +
        (deltaX + this.current_node_initial_position[0]) +
        'px) translateY(' +
        (deltaY + this.current_node_initial_position[1]) +
        'px)';
    }
  }
}

const service = new DraggableManager();
export default service;
