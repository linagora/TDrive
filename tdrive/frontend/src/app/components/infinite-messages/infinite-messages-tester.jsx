import React, { Component } from 'react';

import InfiniteMessages from './infinite-messages.js';

export default class InfiniteMessagesTester extends Component {
  constructor() {
    super();

    ///////// Simulate messages
    this.messages = [];
    this.i = 0;
    for (this.i; this.i < 10000; this.i++) {
      this.messages.push({
        content: 'message ' + this.i,
        height: 40 + Math.random() * 100,
        id: this.i,
      });
    }
    setInterval(() => {
      this.messages.push({
        content: 'message ' + this.i,
        height: 40 + Math.random() * 100,
        id: this.i,
      });
      this.i++;
      this.setState({});
    }, 1000);
    ///////////

    this.infinieMessages = null;
  }
  getMessages(offset, limit, callback) {
    if (!offset) {
      setTimeout(() => {
        callback(this.messages.slice(this.messages.length - limit, this.messages.length));
      }, 10);
    } else {
      var offsetPos = 0;
      this.messages.every(m => {
        if (m.id >= offset) {
          return false;
        }
        offsetPos++;
        return true;
      });

      setTimeout(() => {
        if (limit > 0) {
          callback(this.messages.slice(offsetPos - limit, offsetPos));
        } else {
          callback(this.messages.slice(offsetPos + 1, offsetPos - limit));
        }
      }, 10);
    }
  }
  render() {
    return (
      <div className="infinite_messages_tester">
        <InfiniteMessages
          ref={node => (this.infinieMessages = node)}
          getMessages={(offset, limit, callback) => this.getMessages(offset, limit, callback)}
          messages={this.messages}
          offsetKey={'id'}
          top={''}
          renderMessage={(message, oldmessage, measure) => (
            <div className="message" style={{ height: message.height }}>
              {message.content}
            </div>
          )}
        />
      </div>
    );
  }
}
