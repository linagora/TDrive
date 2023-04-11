/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash';
import React from 'react';
import PseudoMarkdownCompiler from 'app/features/global/services/pseudo-markdown-compiler-service';
import { DynamicComponent } from './pseudo-markdown-dictionary';

type Props = {
  content: any;
  isApp: boolean;
  eventContainer: any;
  textTransform?: any;
};

const Compile = (props: Props) => {
  let content = props.content;
  const isApp = props.isApp;
  const eventContainer = props.eventContainer;
  let textTransform = props.textTransform;

  if (!content) {
    return PseudoMarkdownCompiler.pseudo_markdown['text'].object('');
  }

  if (!textTransform) textTransform = {};
  if (content.formatted || content.prepared) content = content.formatted || content.prepared;
  if (typeof content === 'string') content = [content];
  if (content.type || content.start) content = [content];

  if (!_.isArray(content)) {
    content = [content];
  }

  try {
    return (
      <>
        {content.map((item: any, index: number) => {
          if (typeof item === 'string') {
            return (
              <span key={JSON.stringify(item) + index} style={textTransform || {}}>
                {item}
              </span>
            );
          } else if (Array.isArray(item)) {
            return (
              <Compile
                key={JSON.stringify(item) + index}
                content={item || ''}
                isApp={isApp}
                eventContainer={eventContainer}
                textTransform={textTransform}
              />
            );
          } else {
            let type = PseudoMarkdownCompiler.pseudo_markdown[item.start];
            if (item.type === 'compile' && isApp && typeof item.content === 'string') {
              return (
                <Compile
                  key={JSON.stringify(item) + index}
                  content={PseudoMarkdownCompiler.compileToJSON(item.content)}
                  isApp={isApp}
                  eventContainer={eventContainer}
                  textTransform={textTransform}
                />
              );
            } else {
              if (item.type) {
                type = PseudoMarkdownCompiler.pseudo_markdown_types[item.type];
              }
              if (type) {
                if (!type.apps_only || isApp) {
                  //If text transform do it
                  const old_textTransform = JSON.parse(JSON.stringify(textTransform));
                  textTransform = JSON.parse(JSON.stringify(textTransform));
                  if (type.textTransform) {
                    Object.keys(type.textTransform).forEach(key => {
                      textTransform[key] = type.textTransform[key];
                    });
                  }

                  textTransform = old_textTransform;

                  return (
                    <span key={JSON.stringify(item) + index}>
                      <DynamicComponent
                        type={type.name || item.type}
                        child={
                          <Compile
                            content={item.content || ''}
                            isApp={isApp}
                            eventContainer={eventContainer}
                            textTransform={textTransform}
                          />
                        }
                        data={item}
                        eventContainer={eventContainer}
                        textTransform={textTransform}
                      />
                    </span>
                  );
                }
              }
            }
          }
        })}
      </>
    );
  } catch (e) {
    //Nothing
  }

  return (
    <span style={textTransform || {}}>
      An error occured while showing PseudoMarkdownCompiler message.
    </span>
  );
};

export default Compile;
