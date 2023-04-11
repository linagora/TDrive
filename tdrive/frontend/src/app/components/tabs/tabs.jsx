/* eslint-disable react/jsx-key */
import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import PerfectScrollbar from 'react-perfect-scrollbar';
import './tabs.scss';

export default class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      i18n: Languages,
      tab: props.selected,
    };
    Languages.addListener(this);
  }
  componentWillUnmount() {
    Languages.removeListener(this);
  }
  select(i) {
    this.setState({ tab: i });
    this.props.onChange && this.props.onChange(i);
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextProps.selected && JSON.stringify(nextProps.selected) != this.oldSelected) {
      nextState.tab = nextProps.selected;
      this.oldSelected = JSON.stringify(nextProps.selected);
    }
  }
  render() {
    var selected = this.state.tab || Object.keys(this.props.tabs || {})[0];
    if (!this.props.tabs[selected]) {
      selected = Object.keys(this.props.tabs || {})[0];
    }

    return (
      <div className={'component_tabs ' + (this.props.fullBody ? 'full-body ' : '')}>
        <PerfectScrollbar
          options={{ suppressScrollY: true }}
          component="div"
          className="component_tabs_tabs"
        >
          {Object.keys(this.props.tabs || {}).map(i => {
            var item = this.props.tabs[i];
            return (
              <div
                style={item.titleStyle || {}}
                className={
                  'component_tabs_tab ' +
                  (i == selected ? 'selected ' : '') +
                  (item.titleClassName || '') +
                  ' '
                }
                onClick={() => this.select(i)}
              >
                {typeof item.title == 'function' ? item.title() : item.title}
              </div>
            );
          })}
        </PerfectScrollbar>
        <div className="body ">
          {typeof this.props.tabs[selected].render == 'function'
            ? this.props.tabs[selected].render()
            : this.props.tabs[selected].render}
        </div>
      </div>
    );
  }
}
