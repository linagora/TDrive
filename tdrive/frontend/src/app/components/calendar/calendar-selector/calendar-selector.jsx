/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import React from 'react';
import './calendar-selector.scss';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import Select from 'components/select/select.jsx';
import MenusManager from 'app/components/menus/menus-manager.jsx';
import WorkspacesService from 'app/deprecated/workspaces/workspaces.jsx';
import Languages from 'app/features/global/services/languages-service';

export default class CalendarSelector extends React.Component {
  constructor(props) {
    super();
    this.props = props;

    this.state = {
      selected: [],
    };
  }

  delete(item) {
    var list = this.props.value.map(item => item.calendar_id);
    const index = list.indexOf(item.id);
    if (index >= 0) {
      list.splice(index, 1);
      this.change(list);
    }
    MenusManager.closeMenu();
  }

  openMenu(evt, item) {
    if (this.props.readonly) {
      return;
    }
    MenusManager.openMenu(
      [
        {
          className: 'error',
          icon: 'trash',
          text: Languages.t('components.calendar.calendarselector.remove', [], 'Retirer'),
          onClick: () => {
            this.delete(item);
          },
        },
      ],
      { x: evt.clientX, y: evt.clientY, width: 150 },
      'bottom',
    );
  }

  change(list) {
    if (this.props.onChange)
      this.props.onChange(
        list
          .map(id => {
            var cal = Collections.get('calendars').find(id);
            if (!cal) {
              return undefined;
            }
            return {
              calendar_id: cal.id,
              workspace_id: cal.workspace_id,
            };
          })
          .filter(item => item),
      );
  }

  render() {
    return (
      <div
        className={
          'calendar_selector_container ' +
          (this.props.medium ? 'medium ' : '') +
          (this.props.small ? 'small ' : '') +
          (this.props.big ? 'big ' : '') +
          this.props.className
        }
      >
        <div className="selected_calendars_list calendar_selector_part">
          {this.props.value.map(ws_cal_id => {
            var item = Collections.get('calendars').find(ws_cal_id.calendar_id);
            if (!item || item.workspace_id !== WorkspacesService.currentWorkspaceId) {
              return '';
            }
            return (
              <div
                ref={node => (this.node = node)}
                onClick={evt => this.openMenu(evt, item)}
                className={'calendar_item ' + (this.props.readonly ? '' : 'removable')}
              >
                <div className="calendar_color" style={{ background: item.color }} />
                {'' + item.title}
              </div>
            );
          })}

          {(!this.props.value || this.props.value.length === 0) && (
            <div className="smalltext right-margin" style={{ lineHeight: '40px' }}>
              {Languages.t(
                'components.calendar.calendarselector.no_workspace_calendar',
                [],
                "Aucun calendrier d'espace de travail.",
              )}
            </div>
          )}
        </div>

        {!this.props.readonly && (
          <div className="list_calendar_to_select">
            <Select
              medium={this.props.medium}
              small={this.props.small}
              big={this.props.big}
              options={[
                {
                  type: 'title',
                  text: Languages.t('scenes.apps.calendar.left.calendars', [], 'Calendriers'),
                  className: 'no-background',
                },
              ].concat(
                this.props.calendarList.map(item => {
                  return {
                    text: (
                      <div className="calendar_selector_part calendar_item">
                        <div className="calendar_color" style={{ background: item.color }} />
                        {item.title}
                      </div>
                    ),
                    value: item.id,
                  };
                }),
              )}
              onChange={v => {
                var list = this.props.value.map(item => item.calendar_id);
                var existe = false;
                // eslint-disable-next-line array-callback-return
                list.map(id => {
                  if (v === id) existe = true;
                });

                if (!existe) {
                  list.push(v);
                }

                //Only one calendar for now
                if (!this.props.allowMultiple) {
                  list = [v];
                }

                this.change(list);
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
