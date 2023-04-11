/* eslint-disable react/jsx-key */
import React, { Component } from 'react';
import InputWithClipBoard from 'components/input-with-clip-board/input-with-clip-board.jsx';
import './component-doc.scss';

export default class ComponentDoc extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div className="component_doc">
        <div className="section header">
          {this.props.title && <div className="title">{this.props.title}</div>}
          {this.props.import && (
            <InputWithClipBoard value={this.props.import} className="full_width" />
          )}
        </div>
        <div className="section">{this.props.children}</div>
        <div className="section">
          {this.props.properties && [
            <div className="subtitle">Properties</div>,
            <table className="properties">
              <thead>
                <tr>
                  <td>Property</td>
                  <td>Type</td>
                  <td>Default</td>
                  <td>Description</td>
                </tr>
              </thead>
              {this.props.properties.map(property => {
                return (
                  <tr>
                    <td>{property[0]}</td>
                    <td>
                      {property[1].split(',').map(item => (
                        <span className="type">{item}</span>
                      ))}
                    </td>
                    <td>{property[2]}</td>
                    <td>{property[3]}</td>
                  </tr>
                );
              })}
            </table>,
            <br />,
            <br />,
          ]}

          {this.props.infos && [
            <div className="subtitle">Infos</div>,
            <div className="text">{this.props.infos}</div>,
          ]}
        </div>
      </div>
    );
  }
}
