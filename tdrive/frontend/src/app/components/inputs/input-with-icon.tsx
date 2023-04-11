/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Input, Col, Row } from 'antd';

import Emojione from 'components/emojione/emojione';
import MenusManager from 'app/components/menus/menus-manager.jsx';
import EmojiPicker from 'components/emoji-picker/emoji-picker.jsx';

import './inputs.scss';

type PropsType = { [key: string]: any };
type StateType = { [key: string]: any };

export default class InputWithIcon extends React.Component<PropsType, StateType> {
  outsideClickListener: (event: any) => void = () => undefined;
  input: any;
  emojiPickerIsOpen: any;
  emojipicker_dom: any;
  allChanEmojies = [
    ':8ball:',
    ':dart:',
    ':joystick:',
    ':video_game:',
    ':bar_chart:',
    ':crystal_ball:',
    ':speech_balloon:',
    ':bulb:',
    ':deciduous_tree:',
    ':palm_tree:',
    ':earth_americas:',
    ':open_file_folder:',
    ':penguin:',
    ':seedling:',
    ':sailboat:',
    ':fire_engine:',
    ':scroll:',
    ':newspaper:',
    ':factory:',
    ':package:',
    ':mailbox:',
    ':moneybag:',
    ':smiley_cat:',
    ':sunglasses:',
  ];
  emoji_dom: any;

  UNSAFE_componentWillMount() {
    this.randomizeEmojies();
  }

  randomizeEmojies() {
    this.allChanEmojies.sort((a, b) => {
      if (b === this.props.value[0]) {
        return -1;
      }
      if (a === this.props.value[0]) {
        return 1;
      }
      return Math.floor(Math.random() * 3) - 1;
    });
  }

  outsideMenuListener() {
    this.closeEmojiPicker();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.outsideClickListener);
  }

  componentDidMount() {
    if (this.props.focusOnDidMount && this.input) {
      this.input.focus();
    }

    this.outsideClickListener = event => {
      if (
        this.emojiPickerIsOpen &&
        this.emojipicker_dom &&
        !this.emojipicker_dom.contains(event.target) &&
        document.contains(event.target)
      ) {
        this.outsideMenuListener();
      }
    };

    this.outsideClickListener = this.outsideClickListener.bind(this);
    document.addEventListener('click', this.outsideClickListener);
  }

  closeEmojiPicker() {
    if (!this.emojiPickerIsOpen) {
      return;
    }

    if (this.props.menu_level !== undefined) {
      MenusManager.closeSubMenu(this.props.menu_level);
    } else {
      MenusManager.closeMenu();
    }

    this.emojiPickerIsOpen = false;
  }

  openEmojiPicker() {
    if (this.emojiPickerIsOpen) {
      return;
    }

    let preferedEmojis = [this.props.value[0]];
    if (this.props.preferedEmoji) {
      preferedEmojis = this.props.preferedEmoji;
    } else {
      this.randomizeEmojies();
      for (let i = 0; i < 5; i++) {
        preferedEmojis[i + 1] = this.allChanEmojies[i];
      }
    }

    const menu = [
      {
        type: 'react-element',
        className: 'menu-cancel-margin',
        reactElement: () => {
          return (
            <EmojiPicker
              refDom={(node: any) => (this.emojipicker_dom = node)}
              onChange={(emoji: any) => this.selectEmoji(emoji)}
            />
          );
        },
      },
    ];
    const elementRect = (window as any).getBoundingClientRect(this.emoji_dom);
    elementRect.x = elementRect.x || elementRect.left;
    elementRect.y = elementRect.y || elementRect.top;
    if (this.props.menu_level !== undefined) {
      MenusManager.openSubMenu(menu, elementRect, this.props.menu_level, 'bottom');
    } else {
      MenusManager.openMenu(menu, elementRect, 'bottom', {});
    }

    setTimeout(() => {
      this.emojiPickerIsOpen = true;
    }, 200);
  }
  selectEmoji(emoji: any) {
    this.closeEmojiPicker();
    const value = [emoji.native, this.props.value[1]];
    this.onChange(value);
  }
  onChange(value: any) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  render() {
    let icon = this.props.value[0];
    if (!this.props.value[0]) {
      this.onChange([this.allChanEmojies[0], this.props.value[1]]);
      icon = this.allChanEmojies[0];
    }
    return (
      <Input.Group size="small">
        <Row wrap={false} align="middle" gutter={[8, 0]}>
          <Col flex="none">
            <div
              className="emoji"
              ref={node => (this.emoji_dom = node)}
              onClick={() => {
                this.openEmojiPicker();
              }}
            >
              <Emojione type={icon} size={24} />
            </div>
          </Col>
          <Col flex="auto">
            {(!this.props.children && (
              <Input
                size={'large'}
                style={{ paddingLeft: 15 }}
                autoFocus
                ref={obj => {
                  this.input = obj;
                  if (this.props.inputRef) this.props.inputRef(obj);
                }}
                type="text"
                placeholder={this.props.placeholder}
                value={this.props.value[1]}
                onPressEnter={this.props.onEnter}
                onChange={evt => {
                  if (this.onChange) this.onChange([this.props.value[0], evt.target.value]);
                }}
              />
            )) ||
              this.props.children}
          </Col>
        </Row>
      </Input.Group>
    );
  }
}
