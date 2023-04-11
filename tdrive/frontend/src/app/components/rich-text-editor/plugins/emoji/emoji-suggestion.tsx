import React from "react";
import Emojione from "app/components/emojione/emojione";
import { EmojiSuggestionType } from "./index";

export default (props: EmojiSuggestionType): JSX.Element => {
  return (
    <>
      <div className="icon">
        <Emojione type={props.native} />
      </div>
      <div className="text">
        {props.colons}{' '}
        <span style={{ opacity: '0.5', textTransform: 'capitalize' }}>{props.name}</span>
      </div>
    </>
  );
};