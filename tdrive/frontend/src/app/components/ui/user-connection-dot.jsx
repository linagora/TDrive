import React, { Component } from 'react';
import './elements.scss';

export default class UserConnectionDot extends React.Component {
  render() {
    if (this.props.connected && !this.props.notificationsDisabled) {
      return <div className="connexion_dot green" />;
    } else if (!this.props.connected && !this.props.notificationsDisabled) {
      return <div className="connexion_dot grey" />;
    } else {
      return <div className="connexion_dot red" />;
    }
  }
}
