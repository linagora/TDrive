// eslint-disable-next-line no-use-before-define
import React, { Component } from 'react';

import UserService from 'app/features/users/services/current-user-service';
import NotificationParameters from 'app/deprecated/user/notification_parameters.js';
import ListenUsers from 'app/features/users/services/listen-users-service';
import UserOnlineStatus from '../online-user-status/online-user-status';

import './user.scss';

export default class User extends Component {
  constructor(props) {
    super();
  }
  UNSAFE_componentWillMount() {
    ListenUsers.listenUser(this.props.user.id);
  }
  componentWillUnmount() {
    ListenUsers.cancelListenUser(this.props.user.id);
  }
  render() {
    var user = this.props.user;
    var notifications_disabled = false;
    if (user && NotificationParameters.hasNotificationsDisabled(user.notifications_preferences)) {
      notifications_disabled = true;
    }
    return (
      <div
        className={
          'user_head ' +
          (this.props.small ? 'small ' : '') +
          (this.props.withBorder === undefined || this.props.withBorder ? 'border ' : '') +
          (this.props.medium ? 'medium ' : '') +
          (this.props.big ? 'big ' : '')
        }
        style={{
          backgroundImage: `url(${UserService.getThumbnail(user)}`,
          width: this.props.size,
          height: this.props.size,
        }}
      >
        {this.props.withStatus && (
          <UserOnlineStatus
            user={user}
            notifications_disabled={notifications_disabled}
            size={
              (this.props.small ? 'small' : undefined) ||
              (this.props.medium ? 'medium' : undefined) ||
              (this.props.big ? 'big' : undefined) ||
              'medium'
            }
          />
        )}
      </div>
    );
  }
}
