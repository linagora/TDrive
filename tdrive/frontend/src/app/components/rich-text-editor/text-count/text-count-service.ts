import { EditorState } from 'draft-js';

export const DEFAULT_THRESHOLD = 70;
export const MAX_TEXT_LENGTH = 12000;

export type TextStats = {
  length: number;
  isTooLong: boolean;
  shouldLimit: boolean;
  isOverThreshold: boolean;
  maxLength: number;
  threshold: number;
};

class TextCountService {
  constructor(public readonly maxLength = MAX_TEXT_LENGTH, public readonly threshold = DEFAULT_THRESHOLD) {
  }

  getStats(editorState: EditorState): TextStats {
    const length = editorState.getCurrentContent().getPlainText('').length;

    return {
      length,
      isTooLong: length > this.maxLength,
      shouldLimit: length > this.maxLength - 1,
      isOverThreshold: Math.round((length / this.maxLength) * 100) > this.threshold,
      maxLength: this.maxLength,
      threshold: this.threshold,
    };
  }
}

export default new TextCountService(MAX_TEXT_LENGTH, DEFAULT_THRESHOLD);
