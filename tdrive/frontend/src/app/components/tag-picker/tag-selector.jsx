/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';
import Picker from 'components/picker/picker.jsx';
import Button from 'components/buttons/button.jsx';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import Icon from 'app/components/icon/icon.jsx';
import ColorPicker from 'components/color-picker/color-picker.jsx';
import Strings from 'app/features/global/utils/strings';
import InputWithColor from 'components/inputs/input-with-color.jsx';
import AlertManager from 'app/features/global/services/alert-manager-service';
import Languages from 'app/features/global/services/languages-service';
import MenusManager from 'app/components/menus/menus-manager.jsx';

class TagEditor extends React.Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      edited_tag_name: '',
      edited_tag_color: '',
    };
  }
  UNSAFE_componentWillMount() {
    var tag = this.props.tag;
    this.state.edited_tag_color = tag.color;
    this.state.edited_tag_name = tag.name;
  }
  saveTag(tag) {
    tag.color = this.state.edited_tag_color || tag.color;
    tag.name = this.state.edited_tag_name || tag.name;
    Collections.get('tags').save(tag, Workspaces.currentWorkspaceId);
    MenusManager.closeSubMenu(this.props.level - 1);
  }
  render() {
    var tag = this.props.tag;
    return (
      <div>
        <InputWithColor
          menu_level={this.props.level}
          className="medium bottom-margin full_width"
          focusOnDidMount
          placeholder={Languages.t('components.tagpicker.tag_name', [], 'Tag name')}
          value={[this.state.edited_tag_color, this.state.edited_tag_name]}
          onEnter={() => {
            this.saveTag(tag);
          }}
          onChange={value => {
            this.setState({ edited_tag_color: value[0], edited_tag_name: value[1] });
          }}
        />
        <div style={{ textAlign: 'right' }}>
          <Button
            className="small"
            onClick={() => {
              this.saveTag(tag);
            }}
            value={Languages.t('general.save')}
          />
        </div>
      </div>
    );
  }
}

export default class TagSelector extends React.Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      edited_tag_name: '',
      edited_tag_color: '',
    };

    this.colors_random_list = ColorPicker.colors.map(a => a).sort(() => Math.random() - 0.5);
    this.next_new_color = 0;
  }
  onUpdate(item) {}
  onCreate(text, cb) {
    var color = this.colors_random_list[this.next_new_color];
    this.next_new_color = (this.next_new_color + 1) % this.colors_random_list.length;

    var new_tag = Collections.get('tags').edit();
    new_tag.name = text;
    new_tag.color = color;
    new_tag.workspace_id = Workspaces.currentWorkspaceId;
    Collections.get('tags').save(new_tag, Workspaces.currentWorkspaceId, tag => {
      cb(new_tag);
    });

    return new_tag;
  }
  onRemove(item, ev) {}
  renderItemChoosen(item) {
    return '';
  }
  editTag(evt, id) {
    var tag = Collections.get('tags').find(id);
    if (!tag) {
      return;
    }
    var menu = [
      { type: 'title', text: Languages.t('general.edit') },
      {
        type: 'react-element',
        reactElement: level => {
          return <TagEditor tag={tag} parent={this} level={level} />;
        },
      },
      { type: 'separator' },
      {
        text: Languages.t('general.remove'),
        className: 'error',
        icon: 'trash',
        onClick: ev => {
          var tag = Collections.get('tags').find(id);
          if (tag) {
            AlertManager.confirm(() => {
              MenusManager.closeSubMenu(this.props.level - 1);
              Collections.get('tags').remove(tag, Workspaces.currentWorkspaceId);
            });
          }
          return false;
        },
      },
    ];
    MenusManager.openSubMenu(menu, { x: evt.clientX, y: evt.clientY }, this.props.level, 'right');
  }
  renderItem(item) {
    var add_option = false;
    if (typeof item == 'string') {
      add_option = true;
      item = { name: item, color: this.colors_random_list[this.next_new_color] };
    }
    var tag = (
      <div
        className={
          'tag ' + (this.props.disabledTags.indexOf(item.id || item.name) >= 0 ? 'disabled' : '')
        }
        style={{ backgroundColor: item.color, margin: '5px 0' }}
      >
        {item.name}
      </div>
    );

    if (add_option) {
      return tag;
    }

    return (
      <div className="tag_selectable">
        <div className="tag_part">{tag}</div>
        {!add_option && !this.props.data && (
          <div
            className="edit"
            onClick={ev => {
              ev.stopPropagation();
              ev.preventDefault();
              this.editTag(ev, item.id);
            }}
          >
            <Icon type="ellipsis-h" />
          </div>
        )}
      </div>
    );
  }
  search(text, cb) {
    var res = Collections.get('tags').findBy({ workspace_id: Workspaces.currentWorkspaceId });
    if (this.props.data) {
      res = this.props.data;
    }

    res = res
      .filter(function (item) {
        if (
          Strings.removeAccents(item.name.toLowerCase().replace(/ +/, '')).indexOf(
            Strings.removeAccents(text.toLowerCase().replace(/ +/, '')),
          ) !== -1
        ) {
          return true;
        }
        return false;
      })
      .sort((a, b) => {
        return this.props.disabledTags.indexOf(a.id) >= 0 ? -1 : 1;
      });
    cb(res);
  }
  render() {
    return (
      <Picker
        className={'tagPicker ' + (this.props.disabled ? 'disabled ' : '')}
        ref={picker => {
          this.picker = picker;
        }}
        title={false}
        search={(text, cb) => {
          this.search(text, cb);
        }}
        renderItem={item => {
          return this.renderItem(item);
        }}
        renderItemChoosen={item => {
          return this.renderItemChoosen(item);
        }}
        renderItemSimply={item => {
          return item.name;
        }}
        canCreate={this.props.canCreate !== false}
        onCreate={(text, cb) => this.onCreate(text, cb)}
        onSelect={item => this.onSelect(item)}
        onChange={this.props.onChange}
        value={this.props.value}
        readOnly={this.props.readOnly}
        inline={this.props.inline}
      />
    );
  }
}
