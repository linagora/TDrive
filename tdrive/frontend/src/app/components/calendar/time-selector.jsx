/* eslint-disable react/prop-types */
/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';
import Input from 'components/inputs/input.jsx';
import Tooltip from 'components/tooltip/tooltip.jsx';
import moment from 'moment';
import DateTimeUtils from 'app/features/global/utils/datetime.js';
import Languages from 'app/features/global/services/languages-service';

export default class TimeSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time_ts: props.ts,
      time_string: moment(new Date(props.ts * 1000)).format(DateTimeUtils.getDefaultTimeFormat()),
    };
    this.old_ts = props.ts;
    this.focus = false;
  }

  shouldComponentUpdate(nextProps, nextStates) {
    if (nextProps.ts != this.old_ts) {
      this.old_ts = nextProps.ts;
      nextStates.time_ts = nextProps.ts;
      if (!this.focus) {
        nextStates.time_string = moment(new Date(nextProps.ts * 1000)).format(
          DateTimeUtils.getDefaultTimeFormat(),
        );
      }
    }
    return true;
  }

  process(string) {
    var h, m, am_pm;
    var error = false;

    if (string) {
      var match = string.match(/^[^0-9]*([0-9]+)([^0-9]+)?([0-9]*)?(.*?)$/);

      if (match) {
        h = parseInt(match[1]);
        m = parseInt(match[3] || '0');
        am_pm = ((match[4] ? match[4] : match[2]) || '').toLocaleLowerCase();
        if (am_pm && (am_pm[0] == 'p' || am_pm.indexOf('pm') >= 0)) {
          am_pm = 'PM';
        } else if (am_pm && (am_pm[0] == 'a' || am_pm.indexOf('am') >= 0)) {
          am_pm = 'AM';
        } else {
          if (h == 12) {
            am_pm = 'PM';
          } else {
            am_pm = 'AM';
          }
        }
      } else {
        error = true;
      }

      if (h > 12) {
        am_pm = '';
      }

      if (h > 23) {
        error = true;
      }

      if (m > 59) {
        error = true;
      }
    } else {
      error = true;
    }

    this.state.time_string = string;

    if (!error) {
      var d = moment(h + ':' + m + am_pm, 'LT').toDate();
      var date = new Date(this.state.time_ts * 1000);
      date.setHours(d.getHours());
      date.setMinutes(d.getMinutes());
      this.state.time_ts = date.getTime() / 1000;
      this.state.error = false;
      this.state.time_string_formatted = moment(this.state.time_ts * 1000).format(
        DateTimeUtils.getDefaultTimeFormat(),
      );
      this.props.onChange && this.props.onChange(this.state.time_ts);
    } else {
      this.state.error = true;
    }
    this.setState({});
  }

  blur() {
    this.focus = false;
    this.setState({ time_string: this.state.time_string_formatted, error: false });
    this.props.onChangeBlur && this.props.onChangeBlur(this.state.time_ts);
    this.props.onChange && this.props.onChange(this.state.time_ts);
  }

  render() {
    return (
      <div className={'time_selector ' + this.props.className} style={{ display: 'inline-block' }}>
        <Tooltip
          position="top"
          tooltip={Languages.t('components.workspace.calendar.invalid', [], 'Invalide')}
          overable={false}
          visible={this.state.error}
        >
          <Input
            onBlur={() => this.blur()}
            onFocus={() => (this.focus = true)}
            value={this.state.time_string}
            style={{ maxWidth: 94 }}
            onChange={evt => this.process(evt.target.value)}
          />
        </Tooltip>
      </div>
    );
  }
}
