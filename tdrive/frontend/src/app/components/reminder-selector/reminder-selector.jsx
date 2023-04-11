/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';
import Button from 'components/buttons/button.jsx';
import Input from 'components/inputs/input.jsx';
import Icon from 'app/components/icon/icon.jsx';
import Select from 'components/select/select.jsx';
import './reminder-selector.scss';
import Languages from 'app/features/global/services/languages-service';

export default class ReminderSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reminders: [],
    };

    this.old_value = JSON.stringify(props.reminders || []);
  }

  componentDidMount() {
    this.updateFromProps(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.old_value != JSON.stringify(nextProps.reminders)) {
      this.old_value = JSON.stringify(nextProps.reminders);
      this.updateFromProps(nextProps);
    }
    return true;
  }

  remove(i) {
    delete this.state.reminders[i];
    this.update();
  }

  add() {
    this.state.reminders.push({
      mode: 'push',
      delay_unit: 'minutes',
      delay_value: '30',
    });
    this.update();
  }

  update() {
    var ret = [];
    this.state.reminders.forEach(item => {
      if (item.delay_unit == 'minutes' && item.delay_value > 59) {
        item.delay_value = 30;
      }
      if (item.delay_unit == 'hours' && item.delay_value > 23) {
        item.delay_value = 1;
      }
      if (item.delay_unit == 'days' && item.delay_value > 13) {
        item.delay_value = 1;
      }
      if (item.delay_unit == 'weeks' && item.delay_value < 2) {
        item.delay_value = 2;
      }

      ret.push({
        mode: item.mode,
        delay:
          parseInt(item.delay_value) *
          60 *
          (item.delay_unit == 'hours' ? 60 : 1) *
          (item.delay_unit == 'days' ? 60 * 24 : 1) *
          (item.delay_unit == 'weeks' ? 60 * 24 * 7 : 1),
      });
    });

    if (this.props.onChange) {
      this.props.onChange(ret);
    }

    this.setState({});
  }

  updateFromProps(nextProps) {
    var props = nextProps || this.props;

    var reminders = [];

    (props.reminders || []).forEach(item => {
      var delay_value = parseInt(item.delay / 60);
      var delay_unit = 'minutes';
      if (item.delay > 59 * 60) {
        delay_value = parseInt(item.delay / (60 * 60));
        delay_unit = 'hours';
      }
      if (item.delay > 23 * 60 * 60) {
        delay_value = parseInt(item.delay / (60 * 60 * 24));
        delay_unit = 'days';
      }
      if (item.delay > 13 * 24 * 60 * 60) {
        delay_value = parseInt(item.delay / (60 * 60 * 24 * 7));
        delay_unit = 'weeks';
      }
      reminders.push({
        mode: item.mode,
        delay_value: delay_value,
        delay_unit: delay_unit,
      });
    });

    this.setState({ reminders: reminders });
  }

  render() {
    return (
      <div className="reminderSelector">
        {this.state.reminders.map((reminder, i) => {
          return (
            <div className="bottom-margin" key={`reminder-${i}`}>
              <Select
                className="small small-right-margin"
                value={reminder['mode'] || 'push'}
                style={{ width: 'auto' }}
                onChange={value => {
                  this.state.reminders[i].mode = value;
                  this.update();
                }}
                options={[
                  {
                    text: Languages.t('components.reminder.notification', [], 'Notification'),
                    value: 'push',
                  },
                  {
                    text: Languages.t('components.reminder.by_email', [], 'E-Mail'),
                    value: 'mail',
                  },
                ]}
              />

              <Input
                className="small small-right-margin"
                type="number"
                min="0"
                max="60"
                step="1"
                value={reminder['delay_value'] || '0'}
                onChange={evt => {
                  this.state.reminders[i].delay_value = evt.target.value;
                  if (!evt.target.value) {
                    return;
                  }
                  this.update();
                }}
                style={{ width: 60 }}
              />

              <Select
                className="small small-right-margin"
                value={reminder['delay_unit'] || 'minutes'}
                style={{ width: 'auto', marginLeft: 10 }}
                onChange={value => {
                  this.state.reminders[i].delay_unit = value;
                  this.update();
                }}
                options={[
                  {
                    text: Languages.t('components.reminder.minutes_bef', [], 'minutes avant'),
                    value: 'minutes',
                  },
                  {
                    text: Languages.t('components.reminder.hours_bef', [], 'heures avant'),
                    value: 'hours',
                  },
                  {
                    text: Languages.t('components.reminder.days_bef', [], 'jours avant'),
                    value: 'days',
                  },
                  {
                    text: Languages.t('components.reminder.weeks_bef', [], 'semaines avant'),
                    value: 'weeks',
                  },
                ]}
              />

              <Icon
                type="trash"
                className="remove_icon"
                style={{ verticalAlign: 'middle' }}
                onClick={() => this.remove(i)}
              />
            </div>
          );
        })}

        <Button small className="button secondary-text" onClick={() => this.add()}>
          <Icon type="plus" className="m-icon-small" />{' '}
          {Languages.t('scenes.apps.calendar.modals.reminder_add', [], 'Ajouter un rappel')}
        </Button>
      </div>
    );
  }
}
