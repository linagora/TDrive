/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DraftDecorator, EditorState, Entity, RawDraftContentBlock } from 'draft-js';
import mentionPlugin, { MentionSuggestionType } from './mentions';
import emojiPlugin, { EmojiSuggestionType } from './emoji';
import { ChannelSuggestionType } from './channel';
import commandPlugin, { CommandSuggestionType } from './commands';

export type SupportedSuggestionTypes =
  | MentionSuggestionType
  | EmojiSuggestionType
  | ChannelSuggestionType
  | CommandSuggestionType;

export type SelectOrInsertOptions = {
  addSpaceAfter: boolean;
};

export type DataSerializer = {
  /**
   * Replace patterns in the content string (whole string)
   */
  replace: (content: string) => string;
  open: (entity?: Entity, block?: RawDraftContentBlock) => string;
  close: (entity?: Entity, block?: RawDraftContentBlock) => string;
};

export type EditorSuggestionPlugin<T extends SupportedSuggestionTypes> = {
  resolver: (text: string, callback: (args: { items: T[]; loading?: boolean }) => void) => void;
  decorator: DraftDecorator;
  trigger: string | RegExp;
  resourceType: string;
  getTextDisplay?: (item: T) => string;
  onSelected?: (item: T, editorState: EditorState, options?: SelectOrInsertOptions) => EditorState;
  insert?: (item: T, editorState: EditorState, options?: SelectOrInsertOptions) => EditorState;
  renderSuggestion?: (item: T) => JSX.Element;
  serializer?: DataSerializer;
  returnFullTextForSuggestion?: boolean;
  skipSuggestionForTypes?: Array<EditorSuggestionPlugin<any>['resourceType']>;
};

const plugins = new Map<EditorSuggestionPlugin<any>['resourceType'], EditorSuggestionPlugin<any>>();

addPlugin(emojiPlugin());
addPlugin(mentionPlugin());
//addPlugin(channelPlugin());
addPlugin(commandPlugin());

function addPlugin(plugin: EditorSuggestionPlugin<any>): void {
  plugins.set(plugin.resourceType.toLocaleLowerCase(), plugin);
}

export function getPlugins(types: string[] = []): Array<EditorSuggestionPlugin<any>> {
  const result: Array<EditorSuggestionPlugin<any>> = [];
  types.forEach(type => {
    const t = type.toLocaleLowerCase();
    if (plugins.has(t)) {
      result.push(plugins.get(t)!);
    }
  });

  return result.filter(Boolean);
}
