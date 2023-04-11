// eslint-disable-next-line
import React, { useEffect, useState } from 'react';
import className from 'classnames';
import { EditorState } from 'draft-js';
import TextCountService, { TextStats } from './text-count-service';

import './text-count.scss';

type PropsType = {
  editorState: EditorState;
  displayOnlyAfterThresold: boolean;
};

export const TextCount = (props: PropsType) => {
  const [display, setDisplay] = useState(false);
  const [stats, setStats] = useState<Partial<TextStats>>({
    length: 0,
    isTooLong: false,
    shouldLimit: false,
    isOverThreshold: false,
  });

  useEffect(() => {
    const stats = TextCountService.getStats(props.editorState);

    setDisplay(props.displayOnlyAfterThresold && !!stats.isOverThreshold);
    setStats(stats);
  }, [props.editorState, props.displayOnlyAfterThresold]);

  return (
    <>
      {display && (
        <div className="text-count fade_in">
          <span className={className({ limit: stats.isTooLong })}>
            {stats.length}/{stats.maxLength}
          </span>
        </div>
      )}
    </>
  );
};
