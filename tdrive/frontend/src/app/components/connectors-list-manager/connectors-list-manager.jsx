/* eslint-disable react/prop-types */
/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import AddIcon from '@material-ui/icons/AddOutlined';
import GearIcon from '@material-ui/icons/BuildOutlined';
import Input from 'components/inputs/input.jsx';
import './connectors-list-manager.scss';
import Languages from 'app/features/global/services/languages-service';
import WorkspacesApps from 'app/deprecated/workspaces/workspaces_apps.jsx';
import { getCompanyApplication as getApplication } from 'app/features/applications/state/company-applications';

export default class ConnectorsListManager extends Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      connectors_ids: props.current.map(item => item.id || ''),
      filtered: [],
      input: '',
    };
  }
  filter(text) {
    this.state.input = text;
    var list = this.props.list;
    var res = list
      .filter(el => {
        return el.identity.name.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) >= 0;
      })
      .map(el => el);
    this.setState({ filtered: res });
  }
  componentDidMount() {
    this.filter('');
  }

  renderLine(item, added) {
    var id = item.id || item;

    item = getApplication(id);

    var text = '';
    var button = '';

    text = (
      <div className="text" style={{ display: 'flex', alignItems: 'center' }}>
        {WorkspacesApps.getAppIconComponent(item)}
        {item.identity.name}
      </div>
    );

    if (added) {
      button = (
        <div className="more">
          <GearIcon
            className="m-icon-small config"
            onClick={() => {
              this.props.onConfig(item);
            }}
          />
          <CloseIcon
            className="m-icon-small remove"
            onClick={() => {
              this.state.connectors_ids = this.state.connectors_ids.filter(id =>
                typeof item == 'string' ? item != id : item.id != id,
              );
              this.setState({});
              this.props.onChange(this.state.connectors_ids);
            }}
          />
        </div>
      );
    } else {
      button = (
        <div className="more">
          <AddIcon
            className="m-icon-small add"
            onClick={() => {
              this.state.connectors_ids.push(item.id || this.state.input.toLocaleLowerCase());
              this.setState({ input: '' });
              this.props.onChange(this.state.connectors_ids);
            }}
          />
        </div>
      );
    }

    return (
      <div className="menu no-background">
        {text}
        {button}
      </div>
    );
  }
  render() {
    return (
      <div className="connectorsListManager">
        <div className="menu-title no-separator">
          <div className="text">
            {Languages.t('scenes.apps.tasks.connectors_menu', [], 'Connecteurs')}
          </div>
        </div>

        {this.state.connectors_ids.length == 0 && (
          <div className="menu-text">
            {Languages.t('scenes.apps.tasks.no_connector', [], 'Aucun connecteurs.')}
          </div>
        )}
        {this.state.connectors_ids.map(id => {
          return this.renderLine(id, true);
        })}
        <div className="menu-title no-separator">
          <div className="text">
            {Languages.t('components.connectorslistmanager.add_connectors')}
          </div>
        </div>

        <div className="menu-buttons" style={{ paddingTop: 2, paddingBottom: 2 }}>
          <div className="text">
            <Input
              type="text"
              className="small full_width bottom-margin"
              placeholder={Languages.t('components.listmanager.filter', [], 'Filtrer')}
              style={{ margin: 0 }}
              onChange={evt => this.filter(evt.target.value)}
            />
          </div>
        </div>

        {this.state.filtered.slice(0, 5).map(item => {
          if (this.state.connectors_ids.indexOf(item.id) >= 0) {
            return '';
          }
          return this.renderLine(item, false);
        })}
      </div>
    );
  }
}
