/* eslint-disable react/prop-types */
import React from 'react';

import Loader from 'components/loader/loader.jsx';
import Button from './button.jsx';
import './buttons.scss';

export default class ButtonWithTimeout extends React.Component {
  /*
        props = {
            loading : boolean
            value : text in button
            loadingTimeout : time before show loading
            disabled
            onClick
            style
            className
        }
    */
  constructor() {
    super();
    this.state = {
      showLoader: false,
    };
    this.timeout = '';
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  componentDidUpdate(prevProps) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var that = this;
    if (prevProps.loading && !this.props.loading) {
      if (this.state.showLoader) {
        this.setState({ showLoader: false });
      }
      clearTimeout(this.timeout);
    } else if (!prevProps.loading && this.props.loading) {
      this.timeout = setTimeout(function () {
        that.setState({ showLoader: true });
      }, this.props.loadingTimeout || 2000);
    }
  }
  render() {
    return (
      <div
        className={'buttonWithTimeout_container ' + (this.state.showLoader ? 'is_loading ' : '')}
      >
        <Button
          id={this.props.id}
          refButton={node => (this.input = node)}
          type="button"
          style={this.props.style}
          medium={this.props.medium}
          small={this.props.small}
          big={this.props.big}
          disabled={this.props.disabled}
          className={
            'buttonWithTimeout ' +
            (this.props.disabled ? 'buttonWithTimeoutDisabled' : '') +
            ' ' +
            (this.props.className ? this.props.className : '')
          }
          onClick={this.props.onClick}
        >
          {this.props.value}
        </Button>
        <div className="loaderContainer">
          {this.state.showLoader && <Loader className="loader" color="#FFF" />}
        </div>
      </div>
    );
  }
}
