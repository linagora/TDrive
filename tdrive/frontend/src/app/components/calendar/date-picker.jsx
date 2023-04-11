/* eslint-disable react/prop-types */
import React from 'react';
import Tooltip from 'components/tooltip/tooltip.jsx';
import moment from 'moment';
import DateTimeUtils from 'app/features/global/utils/datetime.js';
import UserService from 'app/features/users/services/current-user-service';
import Globals from 'app/features/global/services/globals-tdrive-app-service';
import DayPicker from './day-picker/day-picker.jsx';
import MenusManager from 'app/components/menus/menus-manager.jsx';
import Input from 'components/inputs/input.jsx';
import Icon from 'app/components/icon/icon.jsx';
import './date-picker.scss';

export default class DatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.display_format = 'D MMM YYYY';

    this.old_props_ts = props.ts;
    this.state = {
      time_ts: props.ts,
      time_string: moment(new Date(props.ts * 1000)).format(this.display_format),
    };

    this.user_language =
      (UserService.getCurrentUser() || {}).language || Globals.window.navigator.language;

    this.months_names = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ].map(m => m.toLocaleLowerCase());
    this.months_long_names = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ].map(m => m.toLocaleLowerCase());
    this.months_names = this.months_names
      .concat(
        moment.localeData().monthsShort() || [
          'jan',
          'feb',
          'mar',
          'apr',
          'may',
          'jun',
          'jul',
          'aug',
          'sep',
          'oct',
          'nov',
          'dec',
        ],
      )
      .map(m => m.toLocaleLowerCase());
    this.months_long_names = this.months_long_names
      .concat(moment.localeData().months())
      .map(m => m.toLocaleLowerCase());
    this.months_names = this.months_names
      .concat(moment.localeData(this.user_language).monthsShort())
      .map(m => m.toLocaleLowerCase());
    this.months_long_names = this.months_long_names
      .concat(moment.localeData(this.user_language).months())
      .map(m => m.toLocaleLowerCase());
    if (
      Globals.window.navigator &&
      Globals.window.navigator.language &&
      Globals.window.navigator.language !== this.user_language
    ) {
      this.months_names = this.months_names.concat(
        (moment.localeData(Globals.window.navigator.language).monthsShort() || []).map(m =>
          m.toLocaleLowerCase(),
        ),
      );
      this.months_long_names = this.months_long_names.concat(
        (moment.localeData(Globals.window.navigator.language).months() || []).map(m =>
          m.toLocaleLowerCase(),
        ),
      );
    }

    this.all_months = this.months_long_names.concat(this.months_names);

    this.focused = false;
  }

  componentWillUnmount() {
    if (this.helper_open) {
      MenusManager.closeMenu();
    }
  }

  shouldComponentUpdate(nextProps, nextStates) {
    if (nextProps.ts !== this.old_props_ts) {
      this.old_props_ts = nextProps.ts;
      nextStates.time_ts = nextProps.ts;
      if (!this.focused) {
        nextStates.time_string = moment(new Date(nextProps.ts * 1000)).format(this.display_format);
      }
    }
    return true;
  }

  process(string) {
    var d, m, y;
    var error = false;

    if (string) {
      var original_string = string;

      //Try to find year
      var year = string.match(/([0-9]{4,4})/);
      if (year && year[1]) {
        y = parseInt(year[1]);
        string = string.replace(year[1], '');
      }

      //Try to find month as text
      var sentences = string.match(/(^|[0-9])([^0-9]+)($|[0-9])/);
      var in_text_month = false;
      if (sentences && sentences[1] !== undefined) {
        sentences.slice(1).forEach(s => {
          // eslint-disable-next-line no-useless-escape
          s = s.replace(/[0-9-'`~!@#$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi, '');
          s = s.trim();
          s = s.toLocaleLowerCase();
          if (s) {
            var found = false;
            this.all_months.forEach((m, i) => {
              if (!found && m.indexOf(s) === 0) {
                found = (i % 12) + 1;
              }
            });
            if (found !== false) {
              in_text_month = found;
              string = string.replace(s, '');
            }
          }
        });
      }
      if (in_text_month) {
        m = in_text_month;
      }

      if (m && y) {
        d = parseInt(string.replace(/[^0-9]/, ''));
      } else {
        //Get all numbers
        var numbers = string.match(/[+-]?\d+(?:\.\d+)?/g);

        if (numbers && numbers.length >= 1) {
          if (y) {
            //Only got year
            if (numbers.length === 1) {
              m = parseInt(numbers[0]);
            } else {
              //>=2
              if (DateTimeUtils.isDateFirstInFormat()) {
                d = parseInt(numbers[0]);
                m = parseInt(numbers[1]);
              } else {
                d = parseInt(numbers[1]);
                m = parseInt(numbers[0]);
              }
              if (m > 12) {
                var tmp = d;
                d = m;
                m = tmp;
              }
            }
          } else if (m) {
            //Only got month
            if (numbers.length === 1) {
              d = parseInt(numbers[0]);
            } else {
              d = parseInt(numbers[0]);
              y = parseInt(numbers[1]);
              if (y < 100 && y >= 50) {
                y += 1900;
              } else if (y < 50) {
                y += 2000;
              }
            }
          } else {
            //Got nothing

            if (numbers.length === 1) {
              y = parseInt(numbers[0]);
              d = 1;
              m = 1;

              if (y < 100 && y >= 50) {
                y += 1900;
              } else if (y < 50) {
                y += 2000;
              }
            } else if (numbers.length === 2) {
              if (Math.max(parseInt(numbers[0]), parseInt(numbers[1])) > 12) {
                y = Math.max(d, m);
                m = Math.min(d, m);
              } else {
                d = parseInt(numbers[0]);
                m = parseInt(numbers[1]);
              }

              if (m > 12) {
                // eslint-disable-next-line no-redeclare
                var tmp = m;
                m = d;
                d = tmp;
              }
            } else if (numbers.length >= 3) {
              if (DateTimeUtils.isDateFirstInFormat()) {
                d = parseInt(numbers[0]);
                m = parseInt(numbers[1]);
                y = parseInt(numbers[2]);
              } else {
                d = parseInt(numbers[1]);
                m = parseInt(numbers[0]);
                y = parseInt(numbers[2]);
              }
            }

            if (y < 100 && y >= 50) {
              y += 1900;
            } else if (y < 50) {
              y += 2000;
            }
          }
        }
      }

      //Last check date is correct
      if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) {
        if ((y && !isNaN(y)) || (m && !isNaN(m)) || (d && !isNaN(d))) {
          //If partial input, do not show error
          if (y && !isNaN(y)) {
            m = m || 1;
            d = d || 1;
          } else if (m && !isNaN(m)) {
            y = new Date().getFullYear() + (m <= new Date().getMonth() + 1 ? 1 : 0);
            d = d || 1;
          } else if (d && !isNaN(d)) {
            m = 1;
            y = y || new Date().getFullYear() + (m <= new Date().getMonth() + 1 ? 1 : 0);
          }
        } else {
          error = true;
        }
      }

      if (y < 1950) {
        error = true;
      }
      if (m < 1 || m > 12) {
        error = true;
      }
      // eslint-disable-next-line no-redeclare
      var tmp = new Date();
      tmp.setMonth(m - 1);
      tmp.setFullYear(y);
      tmp.setDate(d);
      if (d < 1 || d > 31 || tmp.getDate() !== d) {
        error = true;
      }
    } else {
      error = true;
    }

    this.setState({ time_string: original_string });

    if (!error) {
      // eslint-disable-next-line no-redeclare
      var d = moment(d + '-' + m + '-' + y, 'DD-MM-YYYY').toDate();
      this.changeDate(d);
    } else {
      this.setState({ error: true });
      this.setState({});
    }
  }

  changeDate(d, changeInput) {
    var date = new Date(this.state.time_ts * 1000);
    date.setDate(d.getDate());
    date.setMonth(d.getMonth());
    date.setFullYear(d.getFullYear());
    this.setState({ time_ts: date.getTime() / 1000 });
    this.setState({ error: false });

    this.setState({
      time_string_formatted: moment(this.state.time_ts * 1000).format(this.display_format),
    });

    if (changeInput) {
      this.setState({ time_string: this.state.time_string_formatted });
    }

    this.props.onChange && this.props.onChange(this.state.time_ts);
    this.setState({});
    this.input.focus();
  }

  focus() {
    this.closeMenuTimeout && clearTimeout(this.closeMenuTimeout);

    this.focused = true;

    if (!this.state.time_ts) {
      this.setState({ time_ts: new Date().getTime() / 1000 });
    }

    if (!this.helper_open) {
      this.helper_open = true;
      var pos = window.getBoundingClientRect(this.input);
      pos.x = pos.x || pos.left;
      pos.y = pos.y || pos.top;
      MenusManager.openMenu(
        [
          {
            type: 'react-element',
            reactElement: () => (
              <div
                style={{ padding: '20px 24px', margin: -16 }}
                onMouseDown={() => {
                  this.cancelBlur = true;
                }}
              >
                <DayPicker
                  value={moment(this.state.time_ts * 1000)}
                  onChange={value => {
                    var ts = value._d.getTime();
                    MenusManager.closeMenu();
                    setTimeout(() => {
                      this.changeDate(new Date(ts), true);
                      this.cancelBlur = false;
                      this.input.blur();
                    }, 100);
                  }}
                  onClick={() => this.input.focus()}
                />
              </div>
            ),
          },
        ],
        { x: pos.left + pos.width / 2, y: pos.bottom },
        'bottom',
        { allowClickOut: false },
      );
    }
  }

  blur() {
    if (this.cancelBlur) {
      this.cancelBlur = false;
      return;
    }
    this.focused = false;
    this.setState({ time_string: this.state.time_string_formatted, error: false });
    this.closeMenuTimeout && clearTimeout(this.closeMenuTimeout);
    this.closeMenuTimeout = setTimeout(() => {
      MenusManager.closeMenu();
      this.helper_open = false;
    }, 50);

    this.props.onChangeBlur && this.props.onChangeBlur(this.state.time_ts);
    this.props.onChange && this.props.onChange(this.state.time_ts);
  }

  render() {
    return (
      <div className={'date_selector ' + this.props.className} style={{ display: 'inline-block' }}>
        <Tooltip position="top" tooltip="Invalide" overable={false} visible={this.state.error}>
          <Input
            onEchap={() => this.input.blur()}
            onEnter={() => this.input.blur()}
            onBlur={() => this.blur()}
            onFocus={() => this.focus()}
            placeholder={'No date'}
            value={this.state.time_ts ? this.state.time_string : ''}
            style={{ maxWidth: 108 }}
            onChange={evt => this.process(evt.target.value)}
            refInput={node => (this.input = node)}
            big={this.props.big}
            medium={this.props.medium}
            small={this.props.small}
          />
          {this.props.withReset && (
            <div
              className="reset_date"
              onClick={() => {
                this.setState({ time_ts: false });
                this.props.onChangeBlur(this.state.time_ts);
                this.setState({});
              }}
            >
              <Icon type="trash" />
            </div>
          )}
        </Tooltip>
      </div>
    );
  }
}
