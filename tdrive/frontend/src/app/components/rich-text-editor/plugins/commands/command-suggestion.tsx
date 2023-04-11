import React from "react";
import { CommandSuggestionType } from "./index";

export default (props: CommandSuggestionType): JSX.Element => {
  return (
    <div>
      <b>{props.command.split(' ')[0]}</b> {props.command.split(' ').slice(1).join(' ')}
      <span style={{ marginLeft: 5, opacity: 0.5 }}>{props.description}</span>
    </div>
  );
};