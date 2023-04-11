import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { EditorState, RichUtils } from 'draft-js';
import { Bold, Underline, Italic, Code } from 'react-feather';
import { Button, Tooltip } from 'antd';
import {
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  MenuUnfoldOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import Languages from 'app/features/global/services/languages-service';
import DefaultToolbarConfig, {
  GroupName,
  StyleConfig,
  ToolbarConfig,
} from './editor-toolbar-config';
import './editor-toolbar.scss';

// Todo: Check this https://github.com/sstur/react-rte/blob/master/src/lib/EditorToolbar.js
// https://dev.to/rose/rich-text-editing-on-the-web-formatting-text-and-keyboard-shortcuts-in-draft-js-4g9f

type ChangeHandler = (state: EditorState) => unknown;

type EditorToolbarProps = {
  toobarConfig?: ToolbarConfig;
  editorState: EditorState;
  onChange: ChangeHandler;
  buttonSize?: number;
};

export default (props: EditorToolbarProps) => {
  const toolbarConfig = props.toobarConfig || DefaultToolbarConfig;
  const buttonSize = props.buttonSize || 16;
  const buttonGroups = toolbarConfig.display.map(groupName => {
    switch (groupName) {
      case 'INLINE_STYLE_BUTTONS': {
        return _renderInlineStyleButtons(groupName, toolbarConfig);
      }
      case 'BLOCK_TYPE_BUTTONS': {
        return _renderBlockTypeButtons(groupName, toolbarConfig);
      }
      default:
        return null;
    }
  });

  return <div className="editor-toolbar">{buttonGroups}</div>;

  function _renderBlockTypeButtons(groupName: GroupName, config: ToolbarConfig) {
    const { editorState } = props;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    const buttons = (config.BLOCK_TYPE_BUTTONS || []).map((type, index) => (
      <Tooltip
        placement="top"
        title={Languages.t(type.i18n || '', [], type.label)}
        key={`${index}`}
      >
        <Button
          key={`${index}`}
          size="small"
          type="text"
          onMouseDown={e => {
            e.preventDefault();
            _toggleBlockType(type.style);
          }}
          className={classNames('block', { active: type.style === blockType })}
          icon={getBlockIcon(type)}
        />
      </Tooltip>
    ));

    return (
      <div key={groupName} className="button-group">
        {buttons}
      </div>
    );
  }

  function _renderInlineStyleButtons(groupName: GroupName, config: ToolbarConfig) {
    const { editorState } = props;
    const currentStyle = editorState.getCurrentInlineStyle();
    const buttons = (config.INLINE_STYLE_BUTTONS || []).map((type, index) => (
      <Tooltip
        placement="top"
        title={Languages.t(type.i18n || '', [], type.label)}
        key={`${index}`}
      >
        <Button
          key={`${index}`}
          size="small"
          type="text"
          onMouseDown={e => {
            e.preventDefault();
            _toggleInlineStyle(type.style);
          }}
          className={classNames(
            'inline',
            { active: currentStyle.has(type.style) },
            { 'not-active': !currentStyle.has(type.style) },
          )}
          icon={getIcon(type)}
        />
      </Tooltip>
    ));

    return (
      <div key={groupName} className="button-group">
        {buttons}
      </div>
    );
  }

  function getIcon(style: StyleConfig): ReactNode {
    switch (style.style) {
      case 'BOLD':
        return <Bold size={buttonSize} />;
      case 'ITALIC':
        return <Italic size={buttonSize} />;
      case 'UNDERLINE':
        return <Underline size={buttonSize} />;
      case 'STRIKETHROUGH':
        return <StrikethroughOutlined style={{ fontSize: buttonSize }} />;
      case 'CODE':
        return <Code size={buttonSize} />;
      default:
        return <></>;
    }
  }

  function getBlockIcon(style: StyleConfig): ReactNode {
    switch (style.style) {
      case 'unordered-list-item':
        return <UnorderedListOutlined style={{ fontSize: buttonSize }} />;
      case 'ordered-list-item':
        return <OrderedListOutlined style={{ fontSize: buttonSize }} />;
      case 'blockquote':
        return <MenuUnfoldOutlined style={{ fontSize: buttonSize }} />;
      case 'code-block':
        return <CodeOutlined style={{ fontSize: buttonSize }} />;
      default:
        return <></>;
    }
  }

  function _toggleInlineStyle(inlineStyle: string) {
    props.onChange(RichUtils.toggleInlineStyle(props.editorState, inlineStyle));
  }

  function _toggleBlockType(blockType: string): void {
    props.onChange(RichUtils.toggleBlockType(props.editorState, blockType));
  }
};
