/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentBlock, ContentState, EditorState, Modifier } from 'draft-js';
import { getSelectedBlock } from 'draftjs-utils';
import { Channel } from './channel';
import { ChannelType } from 'app/features/channels/types/channel';
import ChannelSuggestion from './channel-suggestion';
import { EditorSuggestionPlugin, SelectOrInsertOptions } from '../';

export type ChannelSuggestionType = ChannelType & { autocomplete_id: number };

export const ChannelTypeType = 'CHANNEL';
const CHANNEL_CHAR = '#';

const findChannelEntities = (
  contentBlock: ContentBlock,
  callback: any,
  contentState: ContentState,
) => {
  contentBlock.findEntityRanges((character: any) => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === ChannelTypeType;
  }, callback);
};

const resolver = (
  text: string,
  max: number,
  callback: (args: { items: ChannelSuggestionType[] }) => void,
) => {
  //TODO
  callback({ items: [] });
};

const addChannel = (
  channel: ChannelSuggestionType,
  editorState: EditorState,
  options: SelectOrInsertOptions,
): EditorState => {
  let spaceAlreadyPresent = false;
  const channelAsString = `${CHANNEL_CHAR}${(channel.name || '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9_\-.\u00C0-\u017F]/g, '')}`;
  const entityKey = editorState
    .getCurrentContent()
    .createEntity(ChannelTypeType, 'IMMUTABLE', channel)
    .getLastCreatedEntityKey();
  const selectedBlock = getSelectedBlock(editorState);
  const selectedBlockText = selectedBlock.getText();
  let focusOffset = editorState.getSelection().getFocusOffset();
  const channelIndex = (selectedBlockText.lastIndexOf(` ${CHANNEL_CHAR}`, focusOffset) || 0) + 1;

  if (selectedBlockText.length === channelIndex + 1) {
    focusOffset = selectedBlockText.length;
  }

  if (selectedBlockText[focusOffset] === ' ') {
    spaceAlreadyPresent = true;
  }

  let updatedSelection = editorState.getSelection().merge({
    anchorOffset: channelIndex,
    focusOffset,
  });
  let newEditorState = EditorState.acceptSelection(editorState, updatedSelection);
  let contentState = Modifier.replaceText(
    newEditorState.getCurrentContent(),
    updatedSelection,
    channelAsString,
    newEditorState.getCurrentInlineStyle(),
    entityKey,
  );

  newEditorState = EditorState.push(newEditorState, contentState, 'insert-characters');

  if (!spaceAlreadyPresent && options.addSpaceAfter) {
    // insert a blank space after mention
    updatedSelection = newEditorState.getSelection().merge({
      anchorOffset: channelIndex + channelAsString.length,
      focusOffset: channelIndex + channelAsString.length,
    });
    newEditorState = EditorState.acceptSelection(newEditorState, updatedSelection);
    contentState = Modifier.insertText(
      newEditorState.getCurrentContent(),
      updatedSelection,
      ' ',
      newEditorState.getCurrentInlineStyle(),
      undefined,
    );
  }

  return EditorState.push(newEditorState, contentState, 'insert-characters');
};

export default (
  options: { maxSuggestions: number } = { maxSuggestions: 10 },
): EditorSuggestionPlugin<ChannelSuggestionType> => ({
  resolver: (text, callback) => resolver(text, options.maxSuggestions, callback),
  decorator: {
    strategy: findChannelEntities,
    component: Channel,
  },
  trigger: /\B(#[a-zA-Z\u00C0-\u017F]*)$/,
  resourceType: ChannelTypeType,
  onSelected: (
    channel: ChannelSuggestionType,
    editorState: EditorState,
    options: SelectOrInsertOptions = { addSpaceAfter: true },
  ) => addChannel(channel, editorState, options),
  renderSuggestion: (channel: ChannelSuggestionType) => ChannelSuggestion(channel),
});
