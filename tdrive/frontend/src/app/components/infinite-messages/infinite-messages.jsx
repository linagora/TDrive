/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';

import Button from 'components/buttons/button.jsx';
import './infinite-messages.scss';

export default class InfiniteMessages extends Component {
  constructor(props) {
    super(props);

    window.test = this;

    this.init(props);

    this.onScroll = this.onScroll.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
  }

  init(props) {
    props = props || this.props;

    this.on_load_min = {};
    if (props.messages.length > 60) {
      this.on_load_min = props.messages.slice(props.messages.length - 60, props.messages.length)[0];
    } else {
      this.on_load_min = props.messages[0] || {};
    }

    this.state = {
      messages: props.messages.filter(m => this.compare(m, this.on_load_min) >= 0),
    };
    this.shouldAutoScroll = true;
    this.messages_min = this.state.messages[0] || {};
    this.messages_med = this.state.messages[this.state.messages.length - 1] || {};
    this.messages_max = this.state.messages[this.state.messages.length - 1] || {};
    this.bloc_top_height = 0;

    this.did_update_messages_data = {};

    this.dom_messages = {};

    this.max_known = this.messages_max;
  }

  componentDidMount() {
    this.did_update_messages = true;
    this.did_update_messages_data = {
      direction: 'bottom_auto_add',
      bloc_top_height: this.dom_visualized_messages_top.clientHeight,
      bloc_bottom_height: this.dom_visualized_messages_bottom.clientHeight,
      scroll_top: this.dom_infinite_messages.scrollTop,
      scroll_height: this.dom_infinite_messages.scrollHeight,
    };

    //    this.dom_infinite_messages.addEventListener("scroll", this.onScroll);
    window.addEventListener('resize', this.onUpdate);

    this.onUpdate();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onUpdate);
    //    this.dom_infinite_messages.removeEventListener("scroll", this.onScroll);
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    this.scroll_distance_from_bottom =
      this.dom_infinite_messages.scrollHeight -
      this.dom_infinite_messages.clientHeight -
      this.dom_infinite_messages.scrollTop;

    if (nextProps.messages.length) {
      if (nextProps.messages[nextProps.messages.length - 1].id) {
        if (this.messages_med.id == this.max_known.id) {
          this.messages_med = nextProps.messages[nextProps.messages.length - 1];
          this.messages_max = nextProps.messages[nextProps.messages.length - 1];
        }
        this.max_known = nextProps.messages[nextProps.messages.length - 1];
      }
    }
    if (this.max_known.id == this.messages_med.id) {
      nextState.messages = nextProps.messages.filter(m => {
        return !m.id || this.compare(m, this.on_load_min) >= 0;
      });
      this.did_update_messages = true;
      this.did_update_messages_data = {
        direction: 'bottom_auto_add',
        bloc_top_height: this.dom_visualized_messages_top.clientHeight,
        bloc_bottom_height: this.dom_visualized_messages_bottom.clientHeight,
        scroll_top: this.dom_infinite_messages.scrollTop,
        scroll_height: this.dom_infinite_messages.scrollHeight,
      };
    }
  }
  componentDidUpdate() {
    this.onUpdate();
  }

  onUpdate() {
    this.did_auto_scroll = new Date();

    this.scrollToBottom();
    var dom_fake_separator_top_visible = Math.max(
      0,
      this.dom_infinite_messages.clientHeight - this.dom_visualized_messages_top.clientHeight,
    );
    if (dom_fake_separator_top_visible == 0) {
      this.dom_fake_separator_top.style.display = 'none';
    } else {
      this.dom_fake_separator_top.style.display = 'block';
    }

    if (this.did_update_messages) {
      this.did_update_messages = false;
      this.bloc_top_height = this.dom_visualized_messages_top.clientHeight;
      this.bloc_bottom_height = this.dom_visualized_messages_bottom.clientHeight;

      if (this.did_update_messages_data.direction == 'bottom') {
        this.scrollToPosition(
          this.dom_anything_on_top.clientHeight +
            (this.did_update_messages_data.bloc_bottom_height -
              (this.did_update_messages_data.scroll_height -
                this.did_update_messages_data.scroll_top)),
        );
      } else if (this.did_update_messages_data.direction == 'bottom_auto_add') {
        //Nothing
      } else {
        this.scrollToPosition(this.bloc_top_height + this.did_update_messages_data.scroll_top);
      }

      this.getVisibleMessages();
    }
  }

  onScroll(evt) {
    if (new Date() - this.did_auto_scroll < 100) {
      return;
    }

    if (
      this.dom_infinite_messages.scrollHeight != this.last_scrollHeight &&
      this.shouldAutoScroll
    ) {
      this.last_scrollHeight = this.dom_infinite_messages.scrollHeight;
      this.scrollToBottom();
    } else {
      var shouldAutoScroll = this.shouldAutoScroll;
      this.shouldAutoScroll = false;
      if (this.props.onAutoScrollChange && shouldAutoScroll) this.props.onAutoScrollChange(false);
    }

    if (this.dom_infinite_messages.scrollTop <= this.dom_infinite_messages.scrollHeight / 8) {
      this.onScrollTop();
    }
    var dist_from_bottom =
      this.dom_infinite_messages.scrollHeight -
      this.dom_infinite_messages.scrollTop -
      this.dom_infinite_messages.clientHeight;
    if (dist_from_bottom <= Math.max(10, this.dom_infinite_messages.scrollHeight / 8)) {
      if (
        dist_from_bottom <= 10 &&
        (this.shouldAutoScroll ||
          this.max_known.id == this.state.messages[this.state.messages.length - 1].id)
      ) {
        // eslint-disable-next-line no-redeclare
        var shouldAutoScroll = this.shouldAutoScroll;
        this.shouldAutoScroll = true;
        if (this.props.onAutoScrollChange && !shouldAutoScroll) this.props.onAutoScrollChange(true);
      } else if (dist_from_bottom <= 10 || this.max_known.id != this.messages_med.id) {
        this.onScrollBottom();
      }
    }

    this.getVisibleMessages();
  }

  getVisibleMessages() {
    if (
      this.last_get &&
      Math.abs(this.last_get.scroll_top - this.dom_infinite_messages.scrollTop) < 40
    ) {
      return [this.last_get.first];
    }

    var first = null;

    var frame = window.getBoundingClientRect(this.dom_infinite_messages);
    frame.x = frame.x || frame.left;
    frame.y = frame.y || frame.top;
    frame.scrollTop = this.dom_infinite_messages.scrollTop;

    Object.keys(this.dom_messages).every(i => {
      var item = this.dom_messages[i];
      if (item.node && item.scrollTop === undefined) {
        item.scrollTop = window.getBoundingClientRect(item.node).top + frame.scrollTop - frame.y;
      }
      if (item.node) {
        if (!first && item.scrollTop > frame.scrollTop) {
          first = item.message;
          return false;
        }
      }
      return true;
    });

    var first_date = new Date((first || {}).creation_date * 1000).setHours(0, 0, 0, 0);

    if (first_date != (this.last_get || {}).first_date) {
      if (this.props.onFirstDateChange) this.props.onFirstDateChange(first_date);
    }

    this.last_get = {
      scroll_top: frame.scrollTop,
      first: first,
      first_date: first_date,
    };

    return [this.last_get.first];
  }

  scrollToBottom(force) {
    if (this.shouldAutoScroll || force) {
      //Make sure we display the last bloc !
      if (
        this.messages_med.id != this.messages_min.id &&
        this.messages_med.id != this.messages_max.id
      ) {
        this.init();
        this.did_update_messages = true;
        this.did_update_messages_data = {
          direction: 'bottom_auto_add',
          bloc_top_height: this.dom_visualized_messages_top.clientHeight,
          bloc_bottom_height: this.dom_visualized_messages_bottom.clientHeight,
          scroll_top: this.dom_infinite_messages.scrollTop,
          scroll_height: this.dom_infinite_messages.scrollHeight,
        };

        this.onUpdate();
      }

      var old_position = this.dom_infinite_messages.scrollTop;
      this.dom_infinite_messages.scrollTop = this.dom_infinite_messages.scrollHeight;
      if (old_position != this.dom_infinite_messages.scrollTop) {
        this.did_auto_scroll = new Date();
      }

      var shouldAutoScroll = this.shouldAutoScroll;
      this.shouldAutoScroll = true;
      if (this.props.onAutoScrollChange && !shouldAutoScroll) this.props.onAutoScrollChange(true);
    }
  }
  scrollToPosition(scrollTop) {
    var old_position = this.dom_infinite_messages.scrollTop;
    this.dom_infinite_messages.scrollTop = scrollTop;
    this.did_auto_scroll = new Date();
  }

  onScrollTop() {
    if (this.is_getting_top_messages) {
      return;
    }

    if (this.no_more_before && this.messages_min.id == this.no_more_before.id) {
      return;
    }
    this.number_of_messages_to_load = 2 * (this.dom_infinite_messages.clientHeight / 20);
    this.is_getting_top_messages = true;

    this.props.getMessages(this.messages_min.id, parseInt(this.number_of_messages_to_load), res => {
      if (res.length == 0) {
        this.is_getting_top_messages = false;
        this.no_more_before = this.messages_min;
        return;
      }

      var top_list = this.state.messages.filter(
        m => this.compare(m, this.messages_min) >= 0 && this.compare(m, this.messages_med) <= 0,
      );
      top_list = res.concat(top_list);

      this.messages_med = res[res.length - 1];
      this.messages_min = res[0];
      this.messages_max = top_list[top_list.length - 1];

      this.did_update_messages = true;
      this.did_update_messages_data = {
        direction: 'top',
        bloc_top_height: this.dom_visualized_messages_top.clientHeight,
        bloc_bottom_height: this.dom_visualized_messages_bottom.clientHeight,
        scroll_top: this.dom_infinite_messages.scrollTop,
        scroll_height: this.dom_infinite_messages.scrollHeight,
      };

      this.dom_messages = {};

      this.setState({ messages: top_list });

      this.is_getting_top_messages = false;
    });
  }

  onScrollBottom() {
    if (this.is_getting_bottom_messages) {
      return;
    }

    this.number_of_messages_to_load = 2 * (this.dom_infinite_messages.clientHeight / 20);
    this.is_getting_bottom_messages = true;

    this.props.getMessages(
      this.messages_max.id,
      -parseInt(this.number_of_messages_to_load),
      res => {
        if (res.length == 0) {
          this.is_getting_bottom_messages = false;
          var shouldAutoScroll = this.shouldAutoScroll;
          this.shouldAutoScroll = true;
          if (this.props.onAutoScrollChange && !shouldAutoScroll)
            this.props.onAutoScrollChange(true);

          this.max_known = this.state.messages[this.state.messages.length - 1];
          this.messages_min = this.state.messages[0];
          this.messages_max = this.state.messages[this.state.messages.length - 1];
          this.messages_med = this.messages_max;

          return;
        }

        if (this.compare(res[res.length - 1], this.on_load_min) >= 0) {
          var top_list = this.state.messages.filter(m => this.compare(m, res[res.length - 1]) >= 0);
          top_list = top_list.concat(res);

          this.state.messages = this.props.messages.filter(
            m => this.compare(m, this.on_load_min) > 0,
          );

          this.max_known = this.state.messages[this.state.messages.length - 1];
          this.messages_min = this.state.messages[0];
          this.messages_max = this.state.messages[this.state.messages.length - 1];
          this.messages_med = this.messages_max;

          this.did_update_messages = true;
          this.did_update_messages_data = {
            direction: 'bottom_auto_add',
            bloc_top_height: this.dom_visualized_messages_top.clientHeight,
            bloc_bottom_height: this.dom_visualized_messages_bottom.clientHeight,
            scroll_top: this.dom_infinite_messages.scrollTop,
            scroll_height: this.dom_infinite_messages.scrollHeight,
          };

          this.dom_messages = {};

          this.setState({ messages: this.state.messages });
        } else {
          // eslint-disable-next-line no-redeclare
          var top_list = this.state.messages.filter(
            m => this.compare(m, this.messages_med) > 0 && this.compare(m, this.messages_max) <= 0,
          );
          top_list = top_list.concat(res);

          this.messages_min = top_list[0];
          this.messages_med = this.messages_max;
          this.messages_max = top_list[top_list.length - 1];

          this.did_update_messages = true;
          this.did_update_messages_data = {
            direction: 'bottom',
            bloc_top_height: this.dom_visualized_messages_top.clientHeight,
            bloc_bottom_height: this.dom_visualized_messages_bottom.clientHeight,
            scroll_top: this.dom_infinite_messages.scrollTop,
            scroll_height: this.dom_infinite_messages.scrollHeight,
          };

          this.dom_messages = {};

          this.setState({ messages: top_list });
        }

        this.is_getting_bottom_messages = false;
      },
    );
  }

  measure(message) {
    if (this.dom_infinite_messages) {
      this.scrollToBottom();
    }
  }

  //Returns a-b as int
  compare(a, b) {
    if (this.props.compare) {
      return this.props.compare(a, b);
    }
    return a.id - b.id;
  }

  render() {
    var previous_message = null;

    return (
      <div className="infinite_messages" ref={node => (this.dom_infinite_messages = node)}>
        <div ref={node => (this.dom_anything_on_top = node)}>
          {this.props.top || ''}
          {!this.no_more_before && (
            <div style={{ textAlign: 'center' }}>
              <Button
                className="small primary"
                onClick={() => {
                  this.onScrollTop();
                }}
              >
                Load more messages
              </Button>
            </div>
          )}
        </div>
        <div className="fake_separator_top" ref={node => (this.dom_fake_separator_top = node)} />
        <div
          className="visualized_messages top"
          ref={node => (this.dom_visualized_messages_top = node)}
        >
          {this.state.messages.map((message, _i) => {
            if (this.compare(message, this.messages_med) <= 0) {
              var tmp = previous_message;
              previous_message = message;
              var i = _i;
              return (
                <div
                  key={message.id}
                  ref={node =>
                    (this.dom_messages[i] = {
                      node: node,
                      message: message,
                      scrollTop: (this.dom_messages[i] || {}).scrollTop,
                    })
                  }
                >
                  {this.props.renderMessage(message, tmp, () => this.measure(message))}
                </div>
              );
            }
          })}
        </div>
        <div
          className="visualized_messages"
          ref={node => (this.dom_visualized_messages_bottom = node)}
        >
          {this.state.messages.map((message, _i) => {
            if (this.compare(message, this.messages_med) > 0) {
              var tmp = previous_message;
              previous_message = message;
              var i = _i;
              return (
                <div
                  key={message.id}
                  ref={node =>
                    (this.dom_messages[i] = {
                      node: node,
                      message: message,
                      scrollTop: (this.dom_messages[i] || {}).scrollTop,
                    })
                  }
                >
                  {this.props.renderMessage(message, tmp, () => this.measure(message))}
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  }
}
