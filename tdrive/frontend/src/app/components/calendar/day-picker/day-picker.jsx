/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import Icon from 'app/components/icon/icon.jsx';
import moment from 'moment';
import './day-picker.scss';

export default class DayPicker extends Component {
  /*
        this.props :{
            onChange(day)
            value : Array of selected days
        }
    */
  constructor(props) {
    super(props);
    this.state = {
      days: [],
      currentDate: moment(),
    };
    this.openSelected = false;
    window.moment = moment;
  }
  componentDidMount() {
    this.setState(this.updateDay());
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (moment(nextProps.value).valueOf() != this.oldProp) {
      var obj = this.updateDay(nextProps.value);
      nextState.days = obj.days;
      nextState.currentDate = obj.currentDate;
    }
    this.oldProp = moment(nextProps.value).valueOf();
  }
  updateDay(date) {
    var searchedDate = date || moment();
    var days = [];
    var first_day_of_month = moment(searchedDate).startOf('month').startOf('week');
    for (var i = 0; i < 35; i++) {
      days.push(moment(moment(first_day_of_month).add(i, 'days')));
    }
    return {
      days: days,
      currentDate: searchedDate,
    };
  }
  isSelected(day) {
    if (this.props.value) {
      if (
        Array.isArray(this.props.value) &&
        this.props.value.length == 2 &&
        this.props.value[0] &&
        this.props.value[1]
      ) {
        return day.isBetween(this.props.value[0], this.props.value[1], 'day', '[]');
      } else if (
        Array.isArray(this.props.value) &&
        this.props.value.length >= 1 &&
        this.props.value[0]
      ) {
        return day.isSame(this.props.value[0], 'day');
      } else if (!Array.isArray(this.props.value) && this.props.value) {
        return day.isSame(this.props.value, 'day');
      }
    }
    return false;
  }
  isLast(day) {
    if (this.props.value) {
      if (
        Array.isArray(this.props.value) &&
        this.props.value.length == 2 &&
        this.props.value[0] &&
        this.props.value[1]
      ) {
        return day.isSame(this.props.value[1], 'day');
      } else if (
        Array.isArray(this.props.value) &&
        this.props.value.length >= 1 &&
        this.props.value[0]
      ) {
        return day.isSame(this.props.value[0], 'day');
      } else if (!Array.isArray(this.props.value) && this.props.value) {
        return day.isSame(this.props.value, 'day');
      }
    }
    return false;
  }
  render() {
    var last_week = -1;
    return (
      <div
        className="dayPicker"
        onClick={() => this.props.onClick && this.props.onClick()}
        onMouseDown={this.props.onMouseDown}
      >
        <div className="titleDayPicker">
          <div className="month">{moment(this.state.currentDate).format('MMMM YYYY')}</div>
          <div className="chevron">
            <div
              className="move_icon"
              onClick={() => {
                this.setState(this.updateDay(moment(this.state.currentDate).subtract(1, 'months')));
              }}
            >
              <Icon type="angle-left" />
            </div>
            <div
              className="move_icon"
              onClick={() => {
                this.setState(this.updateDay(moment(this.state.currentDate).add(1, 'months')));
              }}
            >
              <Icon type="angle-right" />
            </div>
          </div>
        </div>
        <div className="days">
          <div className="dayName" key={'wn'}>
            Wk
          </div>
          {this.state.days.map((day, index) => {
            if (index < 7) {
              return (
                <div className="dayName" key={day.format()}>
                  {day.format('ddd')}
                </div>
              );
            }
          })}
          {this.state.days.map(day => {
            var list = [];
            if (day.week() != last_week) {
              last_week = day.week();
              list.push(<div className="weeknumber">{last_week}</div>);
            }
            list.push(
              <div
                key={day.format()}
                onClick={() => {
                  if (this.props.onChange) {
                    this.props.onChange(day);
                  }
                }}
                className={
                  'day ' +
                  (day.month() == this.state.currentDate.month() ? '' : 'notInMonth') +
                  ' ' +
                  (day.format('YYYY MM DD') == moment().format('YYYY MM DD') ? 'today' : '') +
                  ' ' +
                  (this.isSelected(day) ? 'selected' : '') +
                  ' ' +
                  (this.isLast(day) ? 'last' : '')
                }
              >
                {day.date()}
              </div>,
            );
            return list;
          })}
        </div>
      </div>
    );
  }
}
