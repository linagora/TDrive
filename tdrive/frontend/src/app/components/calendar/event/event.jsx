/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import './event.scss';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import Icon from 'app/components/icon/icon.jsx';
import Languages from 'app/features/global/services/languages-service';
import UserListManager from 'components/user-list-manager-depreciated/user-list-manager';

import moment from 'moment';

export default class Event extends Component {
  constructor(props) {
    super();
    this.props = props;
  }
  render() {
    var className = '';
    var icon = '';
    var event_duration = '';
    var classNameUser = '';
    if (this.props.inEvent) {
      classNameUser = 'inEvent';
    }

    var event_name =
      this.props.event.title || Languages.t('scenes.apps.drive.navigators.new_file.untitled');

    var event_start = moment(parseInt(this.props.event.from) * 1000).format('LT');

    var event_end = moment(parseInt(this.props.event.to) * 1000).format('LT');

    var location = this.props.event.location || '';

    if (event_start) event_duration = event_start;
    if (event_end)
      event_duration =
        event_duration + Languages.t('components.calendar.event.to', [], ' à ') + event_end;

    var duration = (parseInt(this.props.event.to) - parseInt(this.props.event.from)) / 60;

    if (
      (duration > 0 && duration <= 15) ||
      this.props.event.type == 'deadline' ||
      this.props.event.type == 'remind'
    ) {
      className += ' size_15 ';
    } else if ((duration > 15 && duration <= 30) || this.props.event.all_day) {
      className += ' size_30';
      if (location) event_duration += ', ' + location;
    } else if (duration > 30 && duration <= 45) {
      className += ' size_45';
    } else if (duration > 45 && duration <= 60) {
      className += ' size_60';
    }

    className += ' ' + this.props.event.type;

    if (this.props.event.type == 'remind') {
      icon = 'stopwatch';
    } else if (this.props.event.type == 'deadline') {
      icon = 'stopwatch-slash';
    } else if (this.props.event.type == 'move') {
      icon = 'car-sideview';
    }

    var users = [];
    var emails = [];

    (this.props.event.participants || []).map(obj => {
      if (obj) {
        var regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
        if (obj.user_id_or_mail.match(regex)) {
          var user = Collections.get('users').find(obj.user_id_or_mail);
          users.push(user);
        } else {
          var email = obj.user_id_or_mail;
          emails.push(email);
        }
      }
    });

    return (
      <div
        className={'event_container ' + className + ' ' + classNameUser}
        style={{ background: '' + this.props.getColor() }}
      >
        <div className={'block ' + className}>
          {icon && <Icon type={'' + icon} className="icon" />}

          <span className={'text title ' + className}>
            {event_name}
            <span style={{ fontWeight: 'normal' }}>
              {(duration <= 30 || this.props.event.all_day) && ', ' + event_start}
            </span>
          </span>
        </div>

        {duration > 30 && !this.props.event.all_day && (
          <div className={'time ' + className}>
            <span className="text simple">{event_duration}</span>
          </div>
        )}

        <div className={'place ' + className}>
          <span className="text simple">{'' + location}</span>
        </div>

        <div className={'users ' + className}>
          <UserListManager
            noPlaceholder
            users={(this.props.event.participants || []).map(u => {
              return { id: u.user_id_or_mail };
            })}
            max={4}
            readOnly
            collapsed
            medium
          />
        </div>
      </div>
    );
  }
}
