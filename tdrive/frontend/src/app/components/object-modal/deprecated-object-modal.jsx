import React, { Component } from 'react';
import Icon from 'app/components/icon/icon.jsx';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Tabs from 'components/tabs/tabs.jsx';
import './deprecated-object-modal.scss';
import { Divider } from 'antd';

export class ObjectModalTitle extends Component {
  render() {
    return (
      <div className={'modal_title ' + this.props.className} style={this.props.style}>
        {this.props.children}
      </div>
    );
  }
}
//ObjectModalSeparator
export class ObjectModalSeparator extends Component {
  render() {
    return <div className="separator"></div>;
  }
}
//ObjectModalSectionTitle
export class ObjectModalSectionTitle extends Component {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: this.props.smallMargin ? '16px' : '',
        }}
      >
        <b>{this.props.title || this.props.children}</b>
        <div>{this.props.action}</div>
      </div>
    );
  }
}

// ObjectModalFormTitle
export class ObjectModalFormTitle extends Component {
  render() {
    return (
      <div className={'section_title ' + this.props.className} style={this.props.style}>
        {this.props.icon && <Icon type={this.props.icon} className="m-icon-small" />}
        <span>{this.props.name}</span>
      </div>
    );
  }
}

export class ObjectModal extends Component {
  constructor(props) {
    super();
    this.state = {};
  }
  render() {
    return (
      <div className={'object_modal ' + this.props.className}>
        <div className="top_right_buttons">
          {this.props.onEdit && (
            <div className="square_button" onClick={this.props.onEdit}>
              <Icon type="edit-alt" className="m-icon-small" />
            </div>
          )}
          {this.props.onClose && (
            <div className="square_button" onClick={this.props.onClose}>
              <Icon type="times" className="m-icon-small" />
            </div>
          )}
        </div>

        <div className={!this.props.noCloseButton ? 'title' : ''}>{this.props.title}</div>

        {this.props.tabs && (
          <Tabs
            tabs={this.props.tabs.map(item => {
              return {
                title: item.title || '',
                render: (
                  <div className="body">
                    <PerfectScrollbar options={{ suppressScrollX: true }} component="div">
                      {item.render}
                    </PerfectScrollbar>
                  </div>
                ),
              };
            })}
          />
        )}

        {!this.props.tabs && (
          <div className="body">
            {!!this.props.noScrollBar && (
              <div className="child-with-margin">{this.props.children}</div>
            )}
            {!this.props.noScrollBar && (
              <PerfectScrollbar options={{ suppressScrollX: true }} component="div">
                {this.props.children}
              </PerfectScrollbar>
            )}
          </div>
        )}

        {this.props.footer && <div className="separator" style={{ marginTop: 0 }} />}
        {this.props.footer && (
          <div className="footer bottom-margin">
            <Divider />
            <div className="x-margin">{this.props.footer}</div>
          </div>
        )}
      </div>
    );
  }
}
