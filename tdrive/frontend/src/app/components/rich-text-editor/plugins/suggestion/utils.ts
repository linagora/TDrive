import { CommandResourceType } from '../commands';
import { EmojiResourceType } from '../emoji';
import { MENTION_TYPE } from '../mentions';

export const isMentionType = (suggestionType: string): boolean => {
  return suggestionType === MENTION_TYPE;
};

export const isEmojiType = (suggestionType: string): boolean => {
  return suggestionType === EmojiResourceType;
};

export const isCommandType = (suggestionType: string): boolean => {
  return suggestionType === CommandResourceType;
};
