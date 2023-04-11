/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';

import PseudoMarkdownCompiler from 'app/features/global/services/pseudo-markdown-compiler-service';
import Compile from './compile';
import './twacode.scss';

type Props = {
  className?: string;
  content: any;
  before?: any;
  after?: any;
  isApp?: boolean;
  simple?: boolean;
  onPassiveChange?: (type: string, id: string, context: any, value: any) => void;
  onAction?: (type: string, id: string, context: any, value: any, evt: any) => void;
};

let loadingInteractionTimeout: any = 0;

export default React.memo((props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let container: any = null;
  const passives: any = {};
  const savedStringified = useRef('');

  const [loadingInteraction, setLoadingInteraction] = useState(false);

  const event_container = {
    onAction: (type: string, id: string, context: any, value: any, evt: any) => {
      //Button pressed
      if (type === 'interactive_action') {
        if (props.onAction) {
          setLoadingInteraction(true);
          clearTimeout(loadingInteractionTimeout);
          loadingInteractionTimeout = setTimeout(() => {
            savedStringified.current = '';
            setLoadingInteraction(false);
          }, 5000);
          props.onAction(type, id, context, JSON.parse(JSON.stringify(passives)), evt);
        }
      }

      //Input changed
      if (type === 'interactive_change') {
        passives[id] = value;
        if (props.onPassiveChange) {
          props.onPassiveChange(type, id, context, value);
        }
      }
    },
  };

  useEffect(() => {
    const stringified = JSON.stringify([props.content]);
    if (stringified !== savedStringified.current) {
      clearTimeout(loadingInteractionTimeout);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      savedStringified.current = stringified;
      setLoadingInteraction(false);
      console.log('called setLoadingInteraction');
    }
    return () => {
      //Called when element is unmounted
      clearTimeout(loadingInteractionTimeout);
    };
  }, [JSON.stringify(props.content)]);

  return (
    <div
      ref={node => (container = node)}
      {...props}
      className={'markdown ' + (loadingInteraction ? 'loadingInteraction ' : '') + props.className}
    >
      {!!props.simple &&
        PseudoMarkdownCompiler.compileToSimpleHTML(props.content, true || props.isApp)}
      {!props.simple && (
        <Compile
          content={props.content}
          isApp={true || props.isApp}
          eventContainer={event_container}
        />
      )}
    </div>
  );
});
