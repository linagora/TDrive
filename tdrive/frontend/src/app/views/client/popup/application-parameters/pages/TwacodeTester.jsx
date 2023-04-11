import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import AutoHeight from 'components/auto-height/auto-height.jsx';
import Twacode from 'components/twacode/twacode';

import './pages.scss';

export default class TwacodeTester extends Component {
  constructor(props) {
    super();
    this.state = {
      content: '{}',
      logs: [],
      passives: {},
    };
  }

  onAction(type, id, context, passives, evt) {
    //Button pressed
    if (type === 'interactive_action') {
      this.state.logs.push({
        date: new Date().toLocaleString(),
        content: Languages.t(
          'scenes.app.popup.appsparameters.pages.call_event_handlers',
          ['interactive_action', id, +JSON.stringify(passives)],
          "Event of type '$1' and id '$2' with passives '$3'",
        ),
      });
      this.setState({});
    }
  }

  onPassiveChange(type, id, context, value) {
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.passives[id] = value;
    this.setState({});
  }

  render() {
    return (
      <div className="apps">
        <div className="title">
          {Languages.t('scenes.app.popup.appsparameters.pages.title_tester', [], 'Testeur Twacode')}
        </div>

        <div className="group_section">
          <div className="subtitle">
            {Languages.t(
              'scenes.app.popup.appsparameters.pages._appareance_message_twakcode',
              [],
              "Testez l'apparence de vos messages Twacode",
            )}
          </div>

          <div className="smalltext">
            {Languages.t(
              'scenes.app.popup.appsparameters.pages.instruction_message_tdrivecode',
              [],
              'Commencez par écrire votre message sous le format JSON.',
            )}
          </div>

          <AutoHeight
            placeholder={'{JSON}'}
            className={
              this.state.display_json_error
                ? Languages.t('scenes.app.popup.appsparameters.pages.error_user_code', [], 'erreur')
                : Languages.t('scenes.app.popup.appsparameters.pages.ok_user_code', [], 'ok')
            }
            onChange={evt => {
              try {
                // eslint-disable-next-line no-unused-vars
                var json = JSON.parse(evt.target.value);
                this.setState({
                  logs: [],
                  passives: {},
                  content: evt.target.value,
                  display_json_error: false,
                });
              } catch (e) {
                this.setState({ content: evt.target.value, display_json_error: true });
              }
            }}
          >
            {this.state.content}
          </AutoHeight>

          <br />
          <br />
        </div>
        <div className="group_section">
          <div className="message" style={{ width: '100%' }}>
            {this.state.display_json_error && (
              <span>
                {Languages.t(
                  'scenes.app.popup.appsparameters.pages.error_Json_Ttdrivecode',
                  [],
                  'Il y a une erreur dans votre JSON.',
                )}
              </span>
            )}

            {!this.state.display_json_error && (
              <Twacode
                className="allow_selection"
                id={'tester'}
                content={JSON.parse(this.state.content)}
                isApp={true}
                onAction={(type, id, context, passives, evt) =>
                  this.onAction(type, id, context, passives, evt)
                }
                onPassiveChange={(type, id, context, value) =>
                  this.onPassiveChange(type, id, context, value)
                }
              />
            )}
          </div>
        </div>
        <div className="group_section">
          <div className="subtitle">
            {Languages.t(
              'scenes.app.popup.appsparameters.pages.message_data_next_event',
              [],
              'Données passives qui seront envoyées dans le prochain Événement',
            )}
          </div>

          {Object.keys(this.state.passives).map(key => {
            var value = this.state.passives[key];
            return (
              <div className="text" key={key}>
                <b>{key}</b> {value}
              </div>
            );
          })}
        </div>
        <div className="group_section">
          <div className="subtitle">
            {Languages.t('scenes.app.popup.appsparameters.pages.event_subtitle', [], 'Événements')}
          </div>

          {this.state.logs.reverse().map(event => {
            return (
              <div className="log text" key={event.date}>
                <b>{event.date}</b> {event.content}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
