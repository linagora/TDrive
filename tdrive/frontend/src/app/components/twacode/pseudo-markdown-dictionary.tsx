/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode } from 'react';

import Emojione from 'components/emojione/emojione';
import HighlightedCode from 'components/highlighted-code/highlighted-code';
import User from './blocks/user';
import Chan from './blocks/chan';
import File from 'components/drive/file';
import InputWithClipBoard from 'components/input-with-clip-board/input-with-clip-board.jsx';
import UserService from 'app/features/users/services/current-user-service';
import Button from 'components/buttons/button.jsx';
import Input from 'components/inputs/input.jsx';

export const DynamicComponent = ({
  type,
  child,
  data,
  eventContainer,
  textTransform,
}: {
  type?: string;
  child?: ReactNode;
  data?: any;
  eventContainer?: any;
  textTransform?: any;
}) => {
  if (type === 'text_block_parent') {
    return <span style={textTransform || {}}>{child}</span>;
  }
  if (type === 'text') {
    return <span style={textTransform || {}}>{child}</span>;
  }
  if (type === 'br') {
    return (
      <>
        <br />
        <span>{child}</span>
      </>
    );
  }
  if (type === 'emoji') {
    return <Emojione type={':' + (data.content || '') + ':'} />;
  }
  if (type === 'user') {
    const split = (data.content || '').split(':');
    const id = data.id || split[1];
    const username = split[0];
    return (
      <>
        <User hideUserImage={false} id={id} username={username} />
        <span> </span>
      </>
    );
  }
  if (type === 'channel') {
    const split = (data.content || '').split(':');
    const id = data.id || split[1];
    const name = split[0];
    return (
      <>
        <Chan id={id} name={name} />
        <span> </span>
      </>
    );
  }
  if (type === 'underline') return <div className="underline">{child}</div>;
  if (type === 'strikethrough') return <div className="strikethrough">{child}</div>;
  if (type === 'bold') return <div className="bold">{child}</div>;
  if (type === 'italic') return <div className="italic">{child}</div>;
  if (type === 'mquote') return <div className="multiline-quote">{child}</div>;
  if (type === 'quote') return <div className="one-line-quote">{child}</div>;
  if (type === 'nop') {
    return <>{child}</>;
  }

  if (type === 'mcode') {
    return <HighlightedCode className="multiline-code" code={(data.content || '').trim()} />;
  }
  if (type === 'icode') {
    return <div className="inline-code">{(data.content || '').trim()}</div>;
  }
  if (type === 'url') {
    if (!data.url && data.url !== undefined) {
      return <span className="link">{child}</span>;
    }
    let url = setUrlProtocol(data.url || data.content);
    if (data.user_identifier && UserService.getCurrentUser()) {
      let separator = '?';
      if (url.indexOf('?') > 0) {
        separator = '&';
      }
      url += separator + 'tdrive_user=' + UserService.getCurrentUser().id;
    }
    return (
      // eslint-disable-next-line react/jsx-no-target-blank
      <a target="_blank" rel="noreferrer" href={url?.replace(/^javascript:/, '')}>
        {child}
      </a>
    );
  }
  if (type === 'markdown_link') {
    const linkData = data.content.split('](');
    const url = linkData[1] || '';

    return (
      <a href={setUrlProtocol(url)} target="_BLANK" rel="noreferrer">
        {linkData[0]}
      </a>
    );
  }
  if (type === 'email') {
    return (
      <a target="_blank" rel="noreferrer" href={'mailto:' + (data.content || '')}>
        {child}
      </a>
    );
  }
  if (type === 'system') {
    return <span style={{ color: '#888', fontSize: 13 }}>{child}</span>;
  }

  if (type === 'file') {
    return (
      <div className="drive_view grid inline-files">
        <File
          data={{ id: data.content || '' }}
          notInDrive={true}
          mini={data.mode === 'mini' ? true : false}
        />
      </div>
    );
  }
  if (type === 'iframe') {
    return (
      <iframe
        src={data.src || ''}
        title={'twacode-iframe-' + data.src}
        style={{ height: data.height }}
      />
    );
  }
  if (type === 'image') {
    return <img src={data.src} alt={data.alt || ''} className={'image twacode'} />;
  }
  if (type === 'icon') {
    return <Emojione type={data.src} />;
  }
  if (type === 'progress_bar') {
    return (
      <div className="progress_bar">
        <div style={{ width: (data.progress || 0) + '%' }} />
      </div>
    );
  }
  if (type === 'attachment') {
    return <div className="attachment">{child}</div>;
  }
  if (type === 'button') {
    if (data.inline) {
      return (
        <div
          className={
            'interactive_element underline interactive_message_btn ' +
            (data.style === 'danger' ? 'danger ' : '') +
            (data.style === 'primary' ? 'primary ' : '')
          }
          onClick={evt => {
            if (data.action_id) {
              eventContainer.onAction(
                'interactive_action',
                data.action_id,
                data.interactive_context || {},
                '',
                evt,
              );
            }
          }}
        >
          {child}
        </div>
      );
    }
    return (
      <Button
        type="button"
        className={
          'button interactive_element interactive_message_btn small ' +
          (data.style === 'danger' ? 'danger ' : '') +
          (data.style === 'default' ? 'default ' : '')
        }
        onClick={(evt: any) => {
          if (data.action_id) {
            eventContainer.onAction(
              'interactive_action',
              data.action_id,
              data.interactive_context || {},
              '',
              evt,
            );
          }
        }}
      >
        {child}
      </Button>
    );
  }
  if (type === 'copiable') {
    return <InputWithClipBoard value={data.content || ''} disabled={false} />;
  }
  if (type === 'input') {
    return (
      <Input
        type="text"
        className={
          'interactive_element interactive_message_input medium ' +
          (data.full_width ? 'full_width ' : '')
        }
        defaultValue={data.content || ''}
        placeholder={data.placeholder || 'Write something...'}
        onChange={(evt: any) => {
          eventContainer.onAction(
            'interactive_change',
            data.passive_id,
            data.interactive_context || {},
            evt.target.value,
            evt,
          );
        }}
      />
    );
  }
  if (type === 'select') {
    return (
      <select
        className={
          'select interactive_element interactive_message_input medium ' +
          (data.full_width ? 'full_width ' : '')
        }
        onChange={evt => {
          const value = evt.target.value;
          eventContainer.onAction(
            'interactive_change',
            data.passive_id || data.action_id,
            data.interactive_context || {},
            value,
            evt,
          );
          if (data.action_id) {
            eventContainer.onAction(
              'interactive_action',
              data.action_id,
              data.interactive_context || {},
              value,
              evt.target.value,
            );
          }
        }}
      >
        <option disabled selected={data.values.filter((e: any) => e.selected).length === 0}>
          {data.title}
        </option>
        {data.values.map((item: any) => {
          return (
            <option key={item.value} value={item.value} selected={item.selected}>
              {item.name}
            </option>
          );
        })}
      </select>
    );
  }

  return <></>;
};

class PseudoMarkdownDictionary {
  render_block: { [key: string]: any } = {
    text_block_parent: {
      object: (child: any, _object: any, _eventContainer: any, textTransform: any) => (
        <DynamicComponent type="text_block_parent" child={child} textTransform={textTransform} />
      ),
    },
    text: {
      object: (child: any, _object: any, _eventContainer: any, textTransform: any) => (
        <DynamicComponent type="text" child={child} textTransform={textTransform} />
      ),
    },
    br: {
      object: (child: any) => <DynamicComponent type="br" child={child} />,
    },
    emoji: {
      object: (_child: any, data: any) => <DynamicComponent type="emoji" data={data} />,
    },
    user: {
      object: (_child: any, object: any) => <DynamicComponent type="user" data={object} />,
    },
    channel: {
      object: (_child: any, object: any) => <DynamicComponent type="channel" data={object} />,
    },
    underline: { object: (child: any) => <DynamicComponent type="underline" child={child} /> },
    strikethrough: {
      object: (child: any) => <DynamicComponent type="strikethrough" child={child} />,
    },
    bold: { object: (child: any) => <DynamicComponent type="bold" child={child} /> },
    italic: { object: (child: any) => <DynamicComponent type="italic" child={child} /> },
    mquote: { object: (child: any) => <DynamicComponent type="mquote" child={child} /> },
    quote: { object: (child: any) => <DynamicComponent type="quote" child={child} /> },
    nop: { object: (child: any) => <DynamicComponent type="nop" child={child} /> },
    mcode: {
      object: (_child: any, object: any) => <DynamicComponent type="mcode" data={object} />,
    },
    icode: {
      object: (_child: any, object: any) => <DynamicComponent type="icode" data={object} />,
    },
    url: {
      object: (child: any, object: any) => (
        <DynamicComponent type="url" child={child} data={object} />
      ),
    },
    markdown_link: {
      object: (_child: any, object: any) => <DynamicComponent type="markdown_link" data={object} />,
    },
    email: {
      object: (child: any, object: any) => (
        <DynamicComponent type="email" child={child} data={object} />
      ),
    },
    system: {
      object: (child: any) => <DynamicComponent type="system" child={child} />,
    },
    file: {
      object: (_child: any, object: any) => <DynamicComponent type="file" data={object} />,
    },
    iframe: {
      object: (_child: any, object: any) => <DynamicComponent type="iframe" data={object} />,
    },
    image: {
      object: (_child: any, object: any) => <DynamicComponent type="image" data={object} />,
    },
    icon: {
      object: (_child: any, object: any) => <DynamicComponent type="icon" data={object} />,
    },
    progress_bar: {
      object: (_child: any, object: any) => <DynamicComponent type="progress_bar" data={object} />,
    },
    attachment: { object: (child: any) => <DynamicComponent type="attachment" child={child} /> },
    button: {
      object: (child: any, object: any, eventContainer: any) => (
        <DynamicComponent
          type="attachment"
          child={child}
          data={object}
          eventContainer={eventContainer}
        />
      ),
    },
    copiable: {
      object: (_child: any, object: any) => <DynamicComponent type="copiable" data={object} />,
    },
    input: {
      object: (_child: any, object: any, eventContainer: any) => (
        <DynamicComponent type="input" data={object} eventContainer={eventContainer} />
      ),
    },
    select: {
      object: (_child: any, object: any, eventContainer: any) => (
        <DynamicComponent type="select" data={object} eventContainer={eventContainer} />
      ),
    },
  };
}

function setUrlProtocol(url: string) {
  let protocol = 'https';

  if ((url || '').indexOf('http://') >= 0) {
    protocol = 'http';
  }
  return protocol + '://' + (url || '').replace(/^(https?:\/\/)/, '');
}

const service = new PseudoMarkdownDictionary();
export default service;
