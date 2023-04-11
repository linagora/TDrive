import React, { Component } from 'react';
import './elements.scss';
import UserService from 'app/features/users/services/current-user-service';

export default class User extends React.Component {
  render() {
    return (
      <div className={'user_bloc ' + (this.props.mini ? 'mini ' : '')}>
        <div
          className="userimage"
          style={{ backgroundImage: "url('" + UserService.getThumbnail(this.props.data) + "')" }}
        />
        {!this.props.mini && UserService.getFullName(this.props.data)}
      </div>
    );
  }
}
