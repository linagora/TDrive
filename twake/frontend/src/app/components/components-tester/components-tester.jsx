/* eslint-disable react/jsx-key */
import React, { Component } from 'react';
import Emojione from 'components/emojione/emojione';
import Icon from 'app/components/icon/icon.jsx';
import Menu from 'components/menus/menu.jsx';
import MenusBodyLayer from 'app/components/menus/menus-body-layer.jsx';
import AutoComplete from 'components/auto-complete/auto-complete';
import UserPicker from 'components/user-picker/user-picker.jsx';
import EmojiPicker from 'components/emoji-picker/emoji-picker.jsx';

import Directory from 'components/drive/directory.jsx';
import File from 'components/drive/file';
import DriveMultiSelector from 'components/drive/drive-multi-selector.jsx';

import Rounded from 'components/inputs/rounded.jsx';

import DraggableBodyLayer from 'components/draggable/draggable-body-layer.jsx';

import emojiService from 'app/components/rich-text-editor/emojis-service.jsx';
import User from 'components/ui/user.jsx';

import AutoHeight from 'components/auto-height/auto-height.jsx';
import Tooltip from 'components/tooltip/tooltip.jsx';
import InputWithClipBoard from 'components/input-with-clip-board/input-with-clip-board.jsx';

import './components-tester.scss';
import GroupInputs from './group/inputs.js';

export default class ComponentsTester extends React.Component {
  constructor() {
    super();
    this.state = {
      autocompValue: '',
      visible: false,
    };
  }
  render() {
    return [
      <div className="componentTester">
        <div className="section">
          <div className="title">Test des composants</div>
          <div className="subtitle">ctrl+alt+e pour revenir à Tdrive</div>
        </div>

        <GroupInputs />

        <div className="section">
          <div className="title">Icones</div>

          <div className="title">
            Title <Icon type="comment" />
          </div>
          <div className="subtitle">
            Sub title <Icon type="search" />
          </div>
          <div className="text">
            Text <Icon type="grid" />
          </div>
        </div>

        <div className="section">
          <div className="title">Emojione</div>
          <div className="title">
            Title <Emojione type="🍺" />
          </div>
          <div className="subtitle">
            Subtitle <Emojione type=":smile:" />
          </div>
          <div className="text">
            Text <Emojione type="👍" />
          </div>
        </div>
        <div className="section">
          <div className="title">Tooltip</div>
          <div className="text">
            <Tooltip
              ref={o => (this.tooltip = o)}
              tooltip={'toolltiiiiiiiiip'}
              position={'top'}
              overable={false}
            >
              <div className="to">this is my tooltip top</div>
            </Tooltip>
          </div>
          <button onClick={() => this.tooltip.openWithTimeOut(2)}>open</button>
          <div className="text">
            <Tooltip tooltip={'toolltiiiiiiiiip'} position={'bottom'}>
              <div className="to">this is my tooltip top</div>
            </Tooltip>
          </div>
        </div>

        <div className="section">
          <div className="title">Input with clipboard</div>
          <div className="text">
            <InputWithClipBoard
              value={
                'https://join.slack.com/t/yopmail-groupe/shared_invite/enQtNTY2NjEwNTM4MTMxLTFmYTg2N2U1NjZiMDg4NmMxM2UyOTQ5YjQ1YWE4ZGE2NGVkNTRhMjRlZGMwMmMxZjk1YjViN2M5Y2MzMTgxYjQ'
              }
              disabled={true}
            />
          </div>
        </div>

        <div className="section">
          <div className="title">Menus</div>

          <Menu
            menu={[
              { type: 'menu', text: 'Un menu', icon: 'list' },
              {
                type: 'menu',
                text: 'Un menu avec sous menu',
                icon: 'grid',
                submenu: [
                  { text: 'Sub menu 4', icon: 'search' },
                  { text: 'Sub menu 5', icon: 'search' },
                  { text: 'Sub menu 6', icon: 'search' },
                ],
              },
              {
                type: 'menu',
                text: 'Un menu avec sous menu',
                icon: 'grid',
                submenu: [
                  {
                    type: 'react-element',
                    text: 'Sub menu 6',
                    icon: 'search',
                    reactElement: <div className="hello">salut</div>,
                  },
                ],
              },
              { type: 'separator' },
              { type: 'text', text: 'Du texte' },
            ]}
          >
            Click here !
          </Menu>
        </div>
        <div className="section">
          <div className="title">Auto complete one line</div>
          <AutoComplete
            search={[
              (text, cb) => {
                cb(
                  [
                    {
                      id: 1,
                      username: 'benoit',
                      mail: 'benoit.tallandier@g.a',
                      userimage: 'https://randomuser.me/api/portraits/men/40.jpg',
                    },
                    {
                      id: 2,
                      username: 'romaric',
                      mail: 'romaric.mourgues@g.a',
                      userimage: 'https://randomuser.me/api/portraits/men/41.jpg',
                    },
                    {
                      id: 3,
                      username: 'guillaume',
                      mail: 'romaric.mourgues@g.a',
                      userimage: 'https://randomuser.me/api/portraits/men/42.jpg',
                    },
                    {
                      id: 4,
                      username: 'Amandine',
                      mail: 'romaric.mourgues@g.a',
                      userimage: 'https://randomuser.me/api/portraits/women/40.jpg',
                    },
                  ].filter(function (item) {
                    if (item && item.username.indexOf(text) !== -1) {
                      return true;
                    }
                    return false;
                  }),
                );
              },
              (text, cb) => {
                cb(emojiService.search(text));
              },
            ]}
            max={[5, 5]}
            renderItemChoosen={[
              item => {
                return '@' + (item || {}).username + ' ';
              },
              item => {
                return item.shortname + ' ';
              },
            ]}
            renderItem={[
              item => {
                return (
                  <div style={{ margin: '3px 0px' }}>
                    <User data={item} />
                  </div>
                );
              },
              item => {
                return (
                  <div style={{ margin: '1px 0px' }}>
                    <Emojione type={item.shortname} /> {item.shortname}
                  </div>
                );
              },
            ]}
            regexHooked={[/\B@([\-+\w]*)$/, /\B:([\-+\w]{0}[\-+\w]*)$/]}
            placeholder="Placeholder"
            autoHeight
          />
        </div>
        <div className="section">
          <div className="title">Multi-line input</div>

          <AutoHeight />
        </div>
        <div className="section">
          <div className="title">Users picker</div>
          <div className="subtitle">In menu</div>
          <Menu
            menu={[
              {
                type: 'react-element',
                reactElement: (
                  <UserPicker
                    value={this.state.users_picker_value}
                    onChange={list => this.setState({ users_picker_value: list })}
                  />
                ),
              },
            ]}
          >
            <div className="text">Open menu</div>
          </Menu>

          <br />
          <br />
          <div className="subtitle">Inline</div>

          <UserPicker
            value={this.state.users_picker_value}
            onChange={list => this.setState({ users_picker_value: list })}
            inline
          />

          <br />
          <div className="subtitle">Inline read only</div>

          <UserPicker value={this.state.users_picker_value} readOnly />

          <br />
          <div className="subtitle">Inline read only miniatures</div>

          <UserPicker value={this.state.users_picker_value} readOnly mini />
        </div>
        <div className="section">
          <div className="title">Emoji picker</div>
          <Menu menu={[{ type: 'react-element', reactElement: <EmojiPicker /> }]}>
            Click here !
          </Menu>
        </div>

        <div className={'section ' + (this.state.drive_list ? 'list' : 'grid')}>
          <button
            style={{ float: 'right' }}
            className="medium"
            onClick={() => {
              this.setState({ drive_list: !this.state.drive_list });
            }}
          >
            Toggle display mode
          </button>

          <div className="title">Drive</div>

          <div className="text">
            TODO: Tester drag drop depuis ordinateur
            <br />
            TODO: Faire apparaitre l'icone "drag + menu" au survol
          </div>

          <DriveMultiSelector
            scroller={this.drive_scroller}
            selectionType="drive_1"
            style={{ maxHeight: 400 }}
          >
            <div style={{ padding: 5 }}>
              <div className="subtitle">Dossiers</div>

              <Directory
                selectionType="drive_1"
                data={{ id: 1, name: 'Drive', type: 'google_drive' }}
              />
              <Directory selectionType="drive_1" data={{ id: 2, name: 'Accepté', size: '6000' }} />
              <Directory selectionType="drive_1" data={{ id: 3, name: 'Refusés', size: '19000' }} />

              <Menu
                menu={[
                  { type: 'menu', text: 'Nouveau dossier', icon: 'plus' },
                  { type: 'menu', text: 'ChannelServiceImpl externe', icon: 'grid' },
                ]}
              >
                <Rounded />
              </Menu>

              <br />
              <br />

              <div className="subtitle">Fichiers</div>

              <File
                selectionType="drive_1"
                data={{
                  id: 4,
                  name: 'fonds_marins.jpeg',
                  size: '3000',
                  preview_url:
                    'https://cdn12.picryl.com/photo/2016/12/31/wintry-winter-mood-snow-landscape-nature-landscapes-10fa27-1024.jpg',
                }}
              />
              <File
                selectionType="drive_1"
                data={{
                  id: 5,
                  name: 'photo.jpg',
                  size: '2000',
                  preview_url:
                    'https://www.goodfreephotos.com/albums/turkey/other/landscape-with-river-valley-in-turkey.jpg',
                }}
              />
              <File
                selectionType="drive_1"
                data={{
                  id: 6,
                  name: 'montagnes.png',
                  size: '1500',
                  preview_url: 'https://c1.staticflickr.com/6/5081/5252291555_830a56721b_b.jpg',
                }}
              />
              <File
                selectionType="drive_1"
                data={{
                  id: 7,
                  name: 'chapeau.png',
                  size: '532',
                  preview_url:
                    'https://www.lacerisesurlechapeau.com/wp-content/uploads/2016/07/chapeau-original-trendy-feutre.png',
                }}
              />

              <Menu
                menu={[
                  { type: 'menu', text: 'Nouveau fichier', icon: 'plus', submenu: [] },
                  { type: 'menu', text: 'Depuis un lien', icon: 'link' },
                  { type: 'menu', text: "Importer depuis l'ordinateur", icon: 'monitor' },
                ]}
              >
                <Rounded />
              </Menu>
            </div>
          </DriveMultiSelector>
        </div>
      </div>,
      <MenusBodyLayer />,
      <DraggableBodyLayer />,
    ];
  }
}
