/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, CSSProperties, useEffect } from 'react';
import classNames from 'classnames';
import { Row, Typography } from 'antd';
import { Frown, Terminal, Search } from 'react-feather';

import { isCommandType, isEmojiType, isMentionType } from './utils';
import Languages from 'app/features/global/services/languages-service';

import './suggestion-list.scss';
import { LoadingOutlined } from '@ant-design/icons';

type Props<T> = {
  id: string;
  loading: boolean;
  list: Array<T & { autocomplete_id?: number }> | undefined;
  search: string;
  renderItem: (item: T) => any;
  onSelected: (item: T) => void;
  disableNavigationKey?: boolean;
  selectedIndex: number;
  position: DOMRect | null;
  editorPosition: DOMRect | null;
  suggestionWitdh?: number;
  suggestionMargin?: number;
  suggestionType?: string;
};

const DEFAULT_SUGGESTION_WIDTH = 400;
const DEFAULT_SUGGESTION_MARGIN = 20;
const DEFAULT_SUGGESTION_PADDING = 5;

export const SuggestionList = <T,>(props: Props<T>): JSX.Element => {
  const suggestionWidth = props.suggestionWitdh || DEFAULT_SUGGESTION_WIDTH;
  const suggestionMargin = props.suggestionMargin || DEFAULT_SUGGESTION_MARGIN;
  const [isFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [x, setX] = useState(0);
  const [id, setId] = useState('');
  const [cssPosition, setCssPosition] = useState<CSSProperties>(() => ({
    maxWidth: suggestionWidth,
    minWidth: suggestionWidth,
    top: (props.position?.y || 0) - DEFAULT_SUGGESTION_PADDING,
    position: 'fixed',
    zIndex: 20,
  }));

  // update the position when ID changes
  useEffect(() => {
    setPosition({
      x: props.position?.x || 0,
      y: props.position?.y || 0,
    });
  }, [props.position, props.id]);

  // keep the first X value until Y changes so the suggestion does not move left/right when typing
  useEffect(() => {
    if (props.id !== id) {
      // this is a new search, we can update the X
      setX(props.position?.x || 0);
      setId(props.id);
    }
  }, [props.position, position, props.id, id]);

  useEffect(() => {
    const totalWidth = window.document.body.offsetWidth;
    if (x + suggestionWidth < totalWidth - suggestionMargin) {
      // keep the position just over the cursor
      setCssPosition(cssPosition => {
        const style = {
          ...cssPosition,
          ...{ left: x, top: (props.position?.y || 0) - DEFAULT_SUGGESTION_PADDING },
        };
        delete style.right;
        return style;
      });
    } else if (x - suggestionWidth > 0) {
      // align the end of the suggestion over the cursor
      setCssPosition(cssPosition => {
        const style = {
          ...cssPosition,
          ...{ right: totalWidth - x, top: (props.position?.y || 0) - DEFAULT_SUGGESTION_PADDING },
        };
        delete style.left;
        return style;
      });
    } else {
      // nothing can be aligned correctly, center in the screen
      setCssPosition(cssPosition => {
        const padding = (totalWidth - suggestionWidth) / 2;
        const style = {
          ...cssPosition,
          ...{
            right: padding,
            left: padding,
            top: (props.position?.y || 0) - DEFAULT_SUGGESTION_PADDING,
          },
        };
        return style;
      });
    }
  }, [props.position?.y, x, suggestionMargin, suggestionWidth]);

  const select = (item: T) => {
    item && props.onSelected(item);
  };

  const buildSuggestionDefaultMessage = () => {
    let text = '';
    let icon: JSX.Element = <div />;

    if (props.suggestionType) {
      if (isMentionType(props.suggestionType)) {
        text =
          props.search.length < 3 && props?.list?.length === 0
            ? 'components.rich_text_editor.plugins.suggestions.default_message.display_results'
            : 'components.rich_text_editor.plugins.suggestions.default_message.no_user_found';

        icon =
          props.search.length < 3 && props?.list?.length === 0 ? (
            <Search size={18} color="var(--grey-dark)" className="small-right-margin" />
          ) : (
            <Frown size={18} color="var(--grey-dark)" className="small-right-margin" />
          );
      }

      if (isEmojiType(props.suggestionType)) {
        text = 'components.rich_text_editor.plugins.suggestions.default_message.no_emoji_found';
        icon = <Frown size={18} color="var(--grey-dark)" className="small-right-margin" />;
      }

      if (isCommandType(props.suggestionType)) {
        text = 'components.rich_text_editor.plugins.suggestions.default_message.no_command_found';
        icon = <Terminal size={18} color="var(--grey-dark)" className="small-right-margin" />;
      }
    }

    return (
      <Row justify="center" align="middle" wrap={false}>
        {icon}
        <Typography.Text type="secondary">{Languages.t(text)}</Typography.Text>
      </Row>
    );
  };

  if (cssPosition.left === 0) {
    return <></>;
  }

  return (
    <div className="suggestions" style={cssPosition}>
      <div
        className={classNames(
          ['menu-list', 'as_frame bg-white dark:bg-zinc-900 rounded-lg', 'inline', 'top'],
          {
            fade_in: isFocused && props.list?.length,
          },
        )}
      >
        {props?.list && props.list.length > 0 ? (
          props.list.map((item, index) => {
            return (
              <div
                key={index}
                className={classNames('menu', {
                  is_selected:
                    !props.disableNavigationKey && item.autocomplete_id === props.selectedIndex,
                })}
                onClick={() => select(item)}
                onMouseDown={() => select(item)}
                onFocus={() => console.log('FOCUS', item)}
              >
                {item && props.renderItem(item)}
              </div>
            );
          })
        ) : props.loading ? (
          <></>
        ) : (
          buildSuggestionDefaultMessage()
        )}
        {props.loading && (
          <div
            style={{
              textAlign: 'center',
              fontSize: '12px',
              width: '100%',
              marginBottom: props?.list && props.list.length > 0 ? 8 : 0,
              opacity: 0.5,
            }}
          >
            <LoadingOutlined />
            &nbsp; Looking for more
          </div>
        )}
      </div>
    </div>
  );
};
