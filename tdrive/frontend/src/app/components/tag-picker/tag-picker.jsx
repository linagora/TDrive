/* eslint-disable react/jsx-key */
/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';
import Icon from 'app/components/icon/icon.jsx';
import Button from 'components/buttons/button.jsx';
import './tag-picker.scss';
import MenusManager from 'app/components/menus/menus-manager.jsx';
import TagSelector from './tag-selector.jsx';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import Languages from 'app/features/global/services/languages-service';

export default class TagPicker extends React.Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      currentSelected: [],
      inputValue: '',
      currentList: [],
      selected: [],
      value: this.props.value || [],
      list: props.data || [
        { id: 1, name: Languages.t('scenes.apps.tasks.task_status.todo', [], 'To do') },
        { id: 2, name: Languages.t('scenes.apps.tasks.task_status.current', [], 'Doing') },
        { id: 3, name: Languages.t('scenes.apps.tasks.task_status.done', [], 'Done') },
      ],
    };
  }
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (JSON.stringify(nextProps.value) != JSON.stringify(this.props.value)) {
      this.state.value = nextProps.value;
    }
  }
  UNSAFE_componentWillMount() {
    if (!this.props.data) {
      Collections.get('tags').addListener(this);
      Collections.get('tags').addSource(
        {
          http_base_url: 'globalsearch/tags',
          http_options: {
            workspace_id: Workspaces.currentWorkspaceId,
          },
          websockets: [{ uri: 'tags/' + Workspaces.currentWorkspaceId, options: { type: 'tags' } }],
        },
        Workspaces.currentWorkspaceId,
      );
    }
  }
  componentWillUnmount() {
    if (!this.props.data) {
      Collections.get('tags').removeListener(this);
    }
  }
  addTags(evt) {
    var menu = [
      {
        type: 'react-element',
        reactElement: level => {
          return (
            <TagSelector
              level={level}
              data={
                this.props.data
                  ? this.props.data.map(a => {
                      if (typeof a == 'string') {
                        return { name: a, id: a, color: '#888' };
                      } else {
                        return a;
                      }
                    })
                  : false
              }
              canCreate={this.props.canCreate}
              disabledTags={
                this.state.value.map(item => {
                  return typeof item == 'string' ? item : item.id;
                }) || []
              }
              onChange={value => {
                value.forEach(tag => {
                  if (
                    this.state.value
                      .map(item => {
                        return typeof item == 'string' ? item : item.id;
                      })
                      .indexOf(tag.id || tag.name || tag) < 0
                  ) {
                    this.state.value.push(tag.id || tag.name || tag);
                  }
                });
                if (!this.props.saveButton) this.props.onChange(this.state.value);
                this.setState({});
                if (this.props.menu_level !== undefined) {
                  MenusManager.closeSubMenu(this.props.menu_level);
                } else {
                  MenusManager.closeMenu();
                }
              }}
            />
          );
        },
      },
    ];
    if (this.props.menu_level !== undefined) {
      MenusManager.openSubMenu(
        menu,
        { x: evt.clientX, y: evt.clientY },
        this.props.menu_level,
        'right',
      );
    } else {
      MenusManager.openMenu(menu, { x: evt.clientX, y: evt.clientY }, 'right');
    }
  }
  render() {
    var value = this.state.value || [];

    var tag_list = value.map(tag_id => {
      var tag = false;
      if (this.props.data) {
        if (typeof tag_id == 'string') {
          tag = { name: tag_id, id: tag_id, color: '#888' };
        } else {
          tag = tag_id;
          tag.id = tag.id || tag.name;
          tag.color = tag.color || '#888';
        }
      } else {
        tag = Collections.get('tags').find(tag_id);
      }
      if (!tag) {
        return '';
      }
      var name = tag.name;
      return (
        <div
          className={
            'tag ' + (this.props.inline ? 'inline-tag ' + (this.props.className || '') : '')
          }
          style={{ backgroundColor: tag.color }}
        >
          {name}{' '}
          {!this.props.readOnly && (
            <Icon
              className="remove"
              type="times"
              onClick={() => {
                this.state.value.splice(this.state.value.indexOf(tag.id), 1);
                if (!this.props.saveButton) this.props.onChange(this.state.value);
                this.setState({});
              }}
            />
          )}
        </div>
      );
    });

    if (this.props.inline) {
      return tag_list;
    }

    return (
      <div className={'tagPicker ' + (this.props.className || '')}>
        {!this.props.readOnly && value.length == 0 && (
          <div className="tag notag">{Languages.t('components.tagpicker.notag', [], 'No tag')}</div>
        )}

        {tag_list}

        {!this.props.readOnly && (
          <Button
            className="small secondary-text"
            onClick={evt => {
              this.addTags(evt);
            }}
          >
            <Icon type="plus" className="m-icon-small" /> {Languages.t('general.add', [], 'Add')}
          </Button>
        )}

        {this.props.saveButton && (
          <div className="full_width" style={{ textAlign: 'right' }}>
            <Button
              className="small primary"
              value={Languages.t('general.save')}
              onClick={() => {
                this.props.onChange(this.state.value);
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
