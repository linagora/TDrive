import { ContentBlock, EditorState, Modifier } from 'draft-js';
import { getSelectedBlock, getSelectionEntity, getEntityRange } from 'draftjs-utils';

export type SearchMatchType = {
  // the input text we searched in
  input: string | null;
  // the text which has been found
  text: string | null;
  // the start index to 'text' in 'input'
  start: number;
  // the end index to 'text' in 'input'
  end: number;
  // where the current cursor was in the input string
  focusOffset: number;
};

export function getCurrentBlock(editorState: EditorState): ContentBlock {
  return editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey());
}

/**
 * Add a block after the current one with given type and initial content
 *
 * @param editorState
 * @param newType
 * @param initialContent
 */
export const splitBlockWithType = (
  editorState: EditorState,
  type = 'unstyled',
  splitOffset: number,
  deleteAfter: boolean,
): EditorState => {
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  let updatedSelection = selection.merge({
    anchorOffset: splitOffset,
    focusOffset: splitOffset,
  });

  let newEditorState = EditorState.acceptSelection(editorState, updatedSelection);

  contentState = Modifier.splitBlock(contentState, updatedSelection);
  newEditorState = EditorState.push(editorState, contentState, 'split-block');
  newEditorState = resetBlockWithType(newEditorState, type, '');

  if (deleteAfter) {
    let contentState = newEditorState.getCurrentContent();
    const selectedBlock = getSelectedBlock(newEditorState);

    updatedSelection = newEditorState.getSelection().merge({
      anchorOffset: 0,
      focusOffset: selectedBlock.getText().length,
    });

    contentState = Modifier.replaceText(
      newEditorState.getCurrentContent(),
      updatedSelection,
      '',
      newEditorState.getCurrentInlineStyle(),
    );

    newEditorState = EditorState.push(editorState, contentState, 'insert-characters');
  }

  return newEditorState;
};

/**
 * Will reset the current block with the given type and the initial content
 * Note that it will remove all the text already existing
 *
 * @param editorState
 * @param newType
 * @param initialContent
 * @returns
 */
export const resetBlockWithType = (
  editorState: EditorState,
  newType = 'unstyled',
  initialContent = '',
): EditorState => {
  let contentState = editorState.getCurrentContent();
  const focusOffset = editorState.getSelection().getFocusOffset();
  const updatedSelection = editorState.getSelection().merge({
    anchorOffset: 0,
    focusOffset,
  });
  const newEditorState = EditorState.acceptSelection(editorState, updatedSelection);
  contentState = Modifier.replaceText(
    newEditorState.getCurrentContent(),
    updatedSelection,
    initialContent,
    newEditorState.getCurrentInlineStyle(),
  );

  contentState = Modifier.setBlockType(contentState, updatedSelection, newType);

  return EditorState.push(editorState, contentState, 'change-block-type');
};

export function isMatching(trigger: string | RegExp, textToMatch: string | null) {
  if (typeof trigger === 'string') {
    return getTriggerRange(trigger, textToMatch);
  } else if (trigger instanceof RegExp) {
    return getTriggerMatchRange(trigger, textToMatch);
  }
}

export function getTriggerMatchRange(regexp: RegExp, text: string | null) {
  if (!text || /\s+$/.test(text)) {
    return null;
  }

  const start = text.match(regexp);

  if (!start) {
    return;
  }

  return {
    text: start[1],
  };
}

export function getTriggerRange(term: string, text: string | null) {
  if (!text || /\s+$/.test(text)) return null;

  const start = text.lastIndexOf(term);
  if (start === -1) {
    return null;
  }

  return {
    text: text.substring(start),
  };
}

export function getTextToMatch(
  editorState: EditorState,
  separator = ' ',
  returnFullTextForEntitiesTypes: Array<string> = [],
): SearchMatchType | undefined {
  const selection = editorState.getSelection();
  const selectedBlock: ContentBlock = getSelectedBlock(editorState);
  const entity = getSelectionEntity(editorState);
  let result: SearchMatchType = {
    input: null,
    text: null,
    start: -1,
    end: -1,
    focusOffset: 0,
  };

  if (
    entity &&
    returnFullTextForEntitiesTypes.includes(
      editorState.getCurrentContent().getEntity(entity).getType(),
    )
  ) {
    result = {
      input: getEntityRange(editorState, entity).text,
      text: getEntityRange(editorState, entity).text,
      start: -1,
      end: -1,
      focusOffset: -1,
    };
  } else {
    const selectedBlockText = selectedBlock.getText();
    const focusOffset = selection.getFocusOffset();

    // get the index of the previous separator before the focusOffset (ie before the current cursor position)
    let previousSeparator = selectedBlockText.lastIndexOf(separator, focusOffset);
    let softLineIndex = selectedBlockText.lastIndexOf('\n', focusOffset);
    previousSeparator = softLineIndex >= previousSeparator ? softLineIndex : previousSeparator;

    // get the index of the next separator after the focusOffset (ie after the current cirsor position)
    let endOfTextIndex = 0;
    const nextSeparator = selectedBlockText.indexOf(separator, focusOffset);
    softLineIndex = selectedBlockText.indexOf('\n', focusOffset);

    if (nextSeparator === -1 && softLineIndex === -1) {
      // can not find separator nor soft line: this is the end of the string
      endOfTextIndex = selectedBlockText.length;
    } else if (nextSeparator === -1 && softLineIndex !== -1) {
      // we are in a case where the text does not contains separator but the line ends by a soft return
      endOfTextIndex = softLineIndex;
    } else if (nextSeparator !== -1 && softLineIndex === -1) {
      // no soft line, found separator
      // keep next separator
      endOfTextIndex = nextSeparator;
    } else if (nextSeparator !== -1 && softLineIndex !== -1) {
      // found separator and soft return, keep the one which has higher priority
      endOfTextIndex = softLineIndex >= nextSeparator ? nextSeparator : softLineIndex;
    }

    const text = selectedBlockText.substring(
      previousSeparator === -1 ? 0 : previousSeparator,
      endOfTextIndex,
    );

    result = {
      input: selectedBlockText,
      text,
      start: previousSeparator,
      end: endOfTextIndex,
      focusOffset: focusOffset,
    };
  }

  return result;
}

export function getInsertRange(
  editorState: EditorState,
  firstCharacter: string,
): { start: number; end: number } {
  const selection = editorState.getSelection();
  const content = editorState.getCurrentContent();
  const anchorKey = selection.getAnchorKey();
  const end = selection.getAnchorOffset();
  const block = content.getBlockForKey(anchorKey);
  const text = block.getText();
  const start = text.substring(0, end).lastIndexOf(firstCharacter);

  return {
    start,
    end,
  };
}

export const getSelection = (root: Window = window): Selection | null => {
  let selection: Selection | null = null;
  if (root.getSelection) {
    selection = root.getSelection();
  } else if (root.document.getSelection) {
    selection = root.document.getSelection();
  }
  return selection;
};

export function getSelectionRange(): Range | null {
  const selection = getSelection();

  if (!selection) {
    return null;
  }

  if (selection?.rangeCount === 0) {
    return null;
  }

  return selection?.getRangeAt(0);
}

export function getCaretCoordinates(): DOMRect | null {
  const selection = getSelectionRange();

  if (!selection) {
    return null;
  }

  return selection.getBoundingClientRect();
}

export function insertText(text: string, editorState: EditorState): EditorState {
  const selection = editorState.getSelection();
  const cs = Modifier.insertText(editorState.getCurrentContent(), selection, text);
  const newEditorState = EditorState.push(editorState, cs, 'insert-characters');

  return newEditorState;
}

export function replaceText(text: string, editorState: EditorState): EditorState {
  const selection = editorState.getSelection();
  const cs = Modifier.replaceText(editorState.getCurrentContent(), selection, text);
  const newEditorState = EditorState.push(editorState, cs, 'insert-characters');

  return newEditorState;
}
