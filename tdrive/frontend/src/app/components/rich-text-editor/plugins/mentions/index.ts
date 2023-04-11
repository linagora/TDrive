/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CharacterMetadata, ContentBlock, ContentState, EditorState, Modifier } from 'draft-js';
import { getSelectedBlock } from 'draftjs-utils';

import { Mention } from './mention';
import MentionSuggestion from './mention-suggestion';
import { EditorSuggestionPlugin, SelectOrInsertOptions } from '../';
import AccessRightsService from 'app/features/workspace-members/services/workspace-members-access-rights-service';
import WorkspaceService from 'app/deprecated/workspaces/workspaces';
import { UserType } from 'app/features/users/types/user';
import UserService from 'app/features/users/services/current-user-service';
import RouterService from 'app/features/router/services/router-service';
import ChannelMembersAPIClient from 'app/features/channel-members/api/channel-members-api-client';
import { ChannelMemberType } from 'app/features/channel-members/types/channel-member-types';
import { searchBackend, searchFrontend } from 'app/features/users/hooks/use-search-user-list';

import './style.scss';
import { getUser } from 'app/features/users/hooks/use-user-list';

export const MENTION_TYPE = 'MENTION';
const MENTION_CHAR = '@';

export type MentionSuggestionType = {
  username: string;
};

const findMentionEntities = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState,
) => {
  contentBlock.findEntityRanges((character: CharacterMetadata) => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === MENTION_TYPE;
  }, callback);
};

let resolverId = 0;

const resolver = async (
  text: string,
  max: number,
  callback: (args: { items: MentionSuggestionType[]; loading?: boolean }) => void,
) => {
  text = text.replace(/^@/, '');
  resolverId++;
  const currentResolverId = resolverId;

  const result: Array<MentionSuggestionType & { autocomplete_id: number }> = [];
  const { companyId, workspaceId, channelId } = RouterService.getStateFromRoute();

  if (AccessRightsService.getCompanyLevel(WorkspaceService.currentGroupId) === 'guest') {
    const users = (
      companyId && workspaceId && channelId
        ? await ChannelMembersAPIClient.list({ companyId, workspaceId, channelId })
        : ([] as ChannelMemberType[])
    )
      .map(member => getUser(member.user_id || ''))
      .filter(
        (user: UserType) =>
          `${user.username} ${user.first_name} ${user.last_name} ${user.email}`
            .toLocaleLowerCase()
            .indexOf(text.toLocaleLowerCase()) >= 0,
      );

    for (let j = 0; j < Math.min(max, users.length); j++) {
      result[j] = { ...users[j], ...{ autocomplete_id: j } };
    }

    callback({ items: result });
  } else {
    if (companyId && workspaceId) {
      const fn = (args: { loading: boolean }) => {
        if (currentResolverId !== resolverId) {
          //Search input was replaced by an other one
          return;
        }

        const resultFrontend = searchFrontend(text, {
          companyId,
          workspaceId,
          scope: 'workspace',
        });

        for (let j = 0; j < Math.min(max, resultFrontend.length); j++) {
          result[j] = { ...resultFrontend[j], ...{ autocomplete_id: j } };
        }

        callback({ items: result, loading: args.loading });
      };

      searchBackend(text, {
        companyId,
        workspaceId,
        scope: 'workspace',
        callback: () => {
          fn({ loading: false });
        },
      });

      fn({ loading: true });
    }
  }
};

const addMention = (
  mention: MentionSuggestionType,
  editorState: EditorState,
  options: SelectOrInsertOptions,
): EditorState => {
  let spaceAlreadyPresent = false;
  const username = UserService.getFullName(mention);
  const mentionText = `${MENTION_CHAR}${username}`;
  const entityKey = editorState
    .getCurrentContent()
    .createEntity(MENTION_TYPE, 'IMMUTABLE', mention)
    .getLastCreatedEntityKey();
  const selectedBlock = getSelectedBlock(editorState);
  const selectedBlockText = selectedBlock.getText();
  let focusOffset = editorState.getSelection().getFocusOffset();
  const mentionIndex = (selectedBlockText.lastIndexOf(` ${MENTION_CHAR}`, focusOffset) || 0) + 1;

  if (selectedBlockText.length === mentionIndex + 1) {
    focusOffset = selectedBlockText.length;
  }

  if (selectedBlockText[focusOffset] === ' ') {
    spaceAlreadyPresent = true;
  }

  let updatedSelection = editorState.getSelection().merge({
    anchorOffset: mentionIndex,
    focusOffset,
  });
  let newEditorState = EditorState.acceptSelection(editorState, updatedSelection);
  let contentState = Modifier.replaceText(
    newEditorState.getCurrentContent(),
    updatedSelection,
    mentionText,
    newEditorState.getCurrentInlineStyle(),
    entityKey,
  );

  newEditorState = EditorState.push(newEditorState, contentState, 'insert-characters');

  if (!spaceAlreadyPresent && options.addSpaceAfter) {
    // insert a blank space after mention
    updatedSelection = newEditorState.getSelection().merge({
      anchorOffset: mentionIndex + mentionText.length,
      focusOffset: mentionIndex + mentionText.length,
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
): EditorSuggestionPlugin<MentionSuggestionType> => ({
  resolver: (text, callback) => resolver(text, options.maxSuggestions, callback),
  decorator: {
    strategy: findMentionEntities,
    component: Mention,
  },
  trigger: /\B(@[^\s.,)(@<>;:\/?!]*)$/, //We can't use \w because of accents
  resourceType: MENTION_TYPE,
  getTextDisplay: (mention: MentionSuggestionType) => mention.username,
  onSelected: (
    mention: MentionSuggestionType,
    editorState: EditorState,
    options: SelectOrInsertOptions = { addSpaceAfter: true },
  ) => addMention(mention, editorState, options),
  renderSuggestion: (mention: MentionSuggestionType) => MentionSuggestion(mention),
  serializer: {
    // When in code-block, we choose to not handle the mention the same way: It will be only a text, not a mention
    // this is why we have the <MENTION> and <CODE_MENTION> elements
    replace: content =>
      content
        .replace(/<MENTION\|(.*?)>(.*?)<\/MENTION>/gm, (_match, mention) => mention)
        .replace(
          /<CODE_MENTION\|(.*?)>(.*?)<\/CODE_MENTION>/gm,
          (_match, mention, fullName) => fullName,
        ),
    open: (entity, block) =>
      block?.type === 'code-block'
        ? `<CODE_${MENTION_TYPE}|@${(entity as any).data.username}>`
        : `<${MENTION_TYPE}|@${(entity as any).data.username}>`,
    close: (_entity, block) =>
      block?.type === 'code-block' ? `</CODE_${MENTION_TYPE}>` : `</${MENTION_TYPE}>`,
  },
  returnFullTextForSuggestion: true,
  // will skip suggestion when already in a MENTION block
  skipSuggestionForTypes: [MENTION_TYPE],
});
