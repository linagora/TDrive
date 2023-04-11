/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import React, { createRef, KeyboardEvent } from 'react';
import classNames from 'classnames';
import Draft, {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  DraftEditorCommand,
  DraftHandleValue,
  KeyBindingUtil,
  ContentBlock,
  DraftStyleMap,
  SelectionState,
} from 'draft-js';
import { getSelectionEntity } from 'draftjs-utils';
import EditorDataParser from './editor-data-parser';
import RichTextEditorStateService from 'app/components/rich-text-editor/editor-state-service';
import { SuggestionList } from './plugins/suggestion/suggestion-list';
import {
  getCaretCoordinates,
  getCurrentBlock,
  getTextToMatch,
  insertText,
  isMatching,
  replaceText,
  resetBlockWithType,
  splitBlockWithType,
} from './editor-utils';
import { EditorSuggestionPlugin, SupportedSuggestionTypes, getPlugins } from './plugins';
import './editor.scss';
import { TextCountService } from 'app/components/rich-text-editor/text-count';
import useOnScreen from 'app/features/global/hooks/use-on-screen';
import Logger from 'app/features/global/framework/logger-service';
import 'draft-js/dist/Draft.css';

const { isSoftNewlineEvent } = KeyBindingUtil;

export type EditorTextFormat = 'raw' | 'markdown';
type SyntheticKeyboardEvent = KeyboardEvent<{}> & { code: string };

type CurrentSuggestion<T> = {
  /**
   * The position of the caret the suggestion is linked to
   */
  position: DOMRect | null;
  /**
   * The text which has been searched for the current suggestion
   */
  searchText: string;
  /**
   * The items for the current suggestion
   */
  items: Array<T>;

  /** Is the list loading content from backend */
  loading: boolean;

  /**
   * unique id for the current suggestion results
   */
  id: string;
};

type EditorProps = {
  editorState: EditorState;
  plugins: Array<string>;
  onSubmit?: (content: string, editorState?: EditorState) => void;
  onChange?: (editorState: EditorState) => void;
  onTab?: () => void;
  onFilePaste?: (files: Blob[]) => void;
  clearOnSubmit: boolean;
  outputFormat: EditorTextFormat;
  placeholder?: string;
  onUpArrow?: (e: SyntheticKeyboardEvent) => void;
  onSubmitBlocked?: (reason: string, details?: string) => void;
};

type EditorViewState = {
  activeSuggestion: CurrentSuggestion<SupportedSuggestionTypes> | null;
  suggestionType: string;
  suggestionIndex: number;
  displaySuggestion: boolean;
  editorPosition: DOMRect | null;
  isVisible: boolean;
};

// NOTE: dirty hack to not have to change the whole Editor component to a functional component
// If one day Editor is a functional component, remove this one and use the on screen hook correctly
// Since the editor can be used in an infinite scroll, this is not so easy to pass down the scrolling event without polluting everything...
const OnScreenElement = (props: { onScreen: (status: boolean) => void }): JSX.Element => {
  const ref = createRef<HTMLDivElement>();
  props.onScreen(useOnScreen(ref));
  return <div ref={ref} style={{ width: 0, height: 0 }}></div>;
};

export class EditorView extends React.Component<EditorProps, EditorViewState> {
  outputFormat: EditorTextFormat;
  editor!: Editor | null;
  plugins: Map<EditorSuggestionPlugin<any>['resourceType'], EditorSuggestionPlugin<any>> =
    new Map();
  customStyleMap: DraftStyleMap;
  editorDataParser: EditorDataParser;
  returnFullTextForEntitiesTypes: Array<string>;
  logger: Logger.Logger;

  constructor(props: EditorProps) {
    super(props);

    getPlugins(this.props.plugins || []).forEach(p => this.enablePlugin(p));
    this.outputFormat = this.props.outputFormat || 'markdown';
    this.state = this.getInitialState();
    this.customStyleMap = {
      CODE: {
        borderRadius: 3,
        background: '#232323',
        color: '#e6e1dc',
        padding: '0 5px',
        fontFamily: 'monospace',
        paddingBottom: '1px',
      },
    };

    this.logger = Logger.getLogger(`Apps/Components/RichTextEditor`);

    this.returnFullTextForEntitiesTypes = Array.from(this.plugins.values())
      .filter(plugin => plugin.returnFullTextForSuggestion)
      .map(plugin => plugin.resourceType);
    this.editorDataParser = RichTextEditorStateService.getDataParser(this.props.plugins);
    this.onChange = this.onChange.bind(this);
    this.keyBindingFn = this.keyBindingFn.bind(this);
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.handleReturn = this.handleReturn.bind(this);
    this.handleBeforeInput = this.handleBeforeInput.bind(this);
    this.onDownArrow = this.onDownArrow.bind(this);
    this.onUpArrow = this.onUpArrow.bind(this);
    this.onEscape = this.onEscape.bind(this);
    this.onTab = this.onTab.bind(this);
    this.handlePastedFiles = this.handlePastedFiles.bind(this);
    this.handleBlockStyle = this.handleBlockStyle.bind(this);
    this.shouldHidePlaceHolder = this.shouldHidePlaceHolder.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.focus = this.focus.bind(this);
    this.updateVisible = this.updateVisible.bind(this);
  }

  //To fix https://github.com/facebook/draft-js/issues/1320#issuecomment-472776784
  componentDidCatch(error: any, errorInfo: any) {
    this.forceUpdate();
    this.logger.log(error, errorInfo);
  }

  private enablePlugin(plugin: EditorSuggestionPlugin<any>): void {
    this.plugins.set(plugin.resourceType, plugin);
  }

  private getInitialState(): EditorViewState {
    return {
      activeSuggestion: null,
      suggestionIndex: 0,
      suggestionType: '',
      displaySuggestion: false,
      editorPosition: null,
      isVisible: true,
    };
  }

  private resetState(callback?: () => void | undefined): void {
    this.setState(this.getInitialState(), callback);
  }

  private resetStateAndFocus(): void {
    this.resetState(() => {
      requestAnimationFrame(() => this.focus());
    });
  }

  private isDisplayingSuggestions(): boolean {
    return this.state.displaySuggestion && !!this.state.activeSuggestion?.items.length;
  }

  handleKeyCommand(command: DraftEditorCommand, editorState: EditorState): DraftHandleValue {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return 'handled';
    }

    return 'not-handled';
  }

  /**
   * Handle return before a new block is added to the editor state
   */
  handleReturn(e: SyntheticKeyboardEvent, editorState: EditorState): DraftHandleValue {
    // when displaying suggestion, enter will select the current one
    if (this.isDisplayingSuggestions()) {
      const result = this.onSuggestionSelected(
        this.state.activeSuggestion?.items[this.state.suggestionIndex],
      );

      if (result) {
        return 'handled';
      }
    }

    if (!e.altKey && !e.metaKey && !e.ctrlKey) {
      const selection = editorState.getSelection();
      const currentBlock = getCurrentBlock(editorState);
      const blockType = currentBlock.getType();

      // When on a list,  if the current block length is 0 while pressing Shift+Enter 2 times will
      // add a new unstyled block otherwise, we split the block with the current style type
      // Pressing Enter will submit the message
      if (['unordered-list-item', 'ordered-list-item'].includes(blockType)) {
        if (e.shiftKey) {
          this.onChange(
            currentBlock.getText().length === 0
              ? resetBlockWithType(editorState, 'unstyled')
              : splitBlockWithType(editorState, blockType, selection.getStartOffset(), false),
          );
        } else {
          this.submit(editorState);
        }
        return 'handled';
      }

      // Shift+Enter adds a soft new line
      if (this._handleReturnSoftNewline(e, editorState)) {
        return 'handled';
      }

      if (selection.isCollapsed()) {
        if (['unstyled', 'code-block', 'blockquote'].includes(blockType)) {
          this.submit(editorState);
          return 'handled';
        }
      }
    }
    return 'not-handled';
  }

  submit(editorState: EditorState): boolean {
    if (TextCountService.getStats(editorState).isTooLong) {
      this.props.onSubmitBlocked && this.props.onSubmitBlocked('toolong');
      return false;
    }

    this.props.onSubmit &&
      this.props.onSubmit(this.editorDataParser.toString(editorState, this.outputFormat));
    if (this.props.clearOnSubmit) {
      this.resetStateAndFocus();
    }

    return true;
  }

  /**
   * Handle shift + enter
   *
   * @param e
   * @param editorState
   * @returns
   */
  _handleReturnSoftNewline(e: SyntheticKeyboardEvent, editorState: EditorState): boolean {
    if (isSoftNewlineEvent(e)) {
      const selection = editorState.getSelection();
      const currentBlock = getCurrentBlock(editorState);

      if (selection.isCollapsed()) {
        if (['blockquote', 'code-block'].includes(currentBlock.getType())) {
          this.onChange(RichUtils.insertSoftNewline(editorState));
        } else {
          this.onChange(
            splitBlockWithType(editorState, 'unstyled', selection.getStartOffset(), false),
          );
        }
      } else {
        const content = editorState.getCurrentContent();
        let newContent = Modifier.removeRange(content, selection, 'forward');
        const newSelection = newContent.getSelectionAfter();
        const block = newContent.getBlockForKey(newSelection.getStartKey());
        newContent = Modifier.insertText(
          newContent,
          newSelection,
          '\n',
          block.getInlineStyleAt(newSelection.getStartOffset()),
        );
        this.onChange(EditorState.push(editorState, newContent, 'insert-fragment'));
      }
      return true;
    }
    return false;
  }

  focus() {
    this.editor?.focus();
  }

  onChange(editorState: EditorState) {
    this.props.onChange && this.props.onChange(editorState);
    setTimeout(() => {
      this.updateSuggestionsState();
    });
  }

  keyBindingFn(e: any) {
    return Draft.getDefaultKeyBinding(e);
  }

  updateSuggestionsState(): void {
    const currentEntityKey = getSelectionEntity(this.props.editorState);
    const currentEntityType =
      currentEntityKey &&
      this.props.editorState.getCurrentContent().getEntity(currentEntityKey).getType();

    const searchMatch = getTextToMatch(
      this.props.editorState,
      ' ',
      this.returnFullTextForEntitiesTypes,
    );
    if (!searchMatch || !searchMatch.text) {
      return;
    }

    const triggered = Array.from(this.plugins.values()).some(plugin => {
      // skip suggestion when current entity type is defined to be skipped
      // for example, when in a mention entity, we do not want to show suggestion from text
      // just because
      // 1. A mention has been searched from `@doe`
      // 2. It has been selected by the user and is now displayed as `@John Doe` in the editor
      // 3. Moving cursor in the entity `@John Doe` of type `MENTION` will return a textToMatch = `@John Doe` (which is different from the first search)
      // If not handled, it can lead to unpredictable state, where we can suggest other things than expected and also other suggestion types...
      if (currentEntityType && (plugin.skipSuggestionForTypes || []).includes(currentEntityType)) {
        return false;
      }

      const trigger = isMatching(plugin.trigger, searchMatch.text);

      if (trigger && trigger.text) {
        plugin.resolver(trigger.text, ({ items, loading }) => {
          const position = getCaretCoordinates();
          const activeSuggestion = {
            position,
            searchText: trigger.text,
            items,
            loading: loading || false,
            // unicity is for a given position and a given start index in the search terms
            id: `y=${position?.y},index=${searchMatch.start}`,
          };
          this.setState({
            activeSuggestion,
            suggestionType: plugin.resourceType,
            suggestionIndex: 0,
          });
        });
        return true;
      }

      return false;
    });

    if (triggered) {
      this.setState({ displaySuggestion: true });
    } else {
      this.resetState();
    }
  }

  onSuggestionSelected(suggestion: SupportedSuggestionTypes | undefined): boolean {
    if (!suggestion) {
      return false;
    }

    const type = this.state.suggestionType;
    const plugin = this.plugins.get(type);
    if (!plugin) {
      return false;
    }

    if (!plugin.onSelected) {
      return false;
    }

    const editorState = plugin.onSelected(suggestion, this.props.editorState);
    this.resetStateAndFocus();
    this.onChange(editorState);

    return true;
  }

  renderSuggestion(props: any, type: string): JSX.Element {
    const plugin = this.plugins.get(type);

    if (!plugin) {
      return <></>;
    }

    if (!plugin.renderSuggestion) {
      return <></>;
    }

    return plugin.renderSuggestion(props);
  }

  insertCommand(type: string, data: SupportedSuggestionTypes): void {
    const plugin = this.plugins.get(type);

    if (!plugin || !plugin.insert) {
      return;
    }

    this.onChange(plugin.insert(data, this.props.editorState));
    this.resetStateAndFocus();
  }

  onDownArrow(e: SyntheticKeyboardEvent): void {
    if (this.isDisplayingSuggestions()) {
      e.preventDefault();
      this.setState({
        suggestionIndex: this.state.suggestionIndex - 1 < 0 ? 0 : this.state.suggestionIndex - 1,
      });
    } else {
      const currentBlock = getCurrentBlock(this.props.editorState);
      const selection = this.props.editorState.getSelection();

      if (
        ['blockquote', 'code-block'].includes(currentBlock.getType()) &&
        currentBlock.getLength() === selection.getStartOffset()
      ) {
        // if current block is code or quote, we can create a new block after it if there are no block
        const nextBlock = this.props.editorState
          .getCurrentContent()
          .getBlockAfter(currentBlock.getKey());

        if (nextBlock) {
          const selection = new SelectionState({
            anchorKey: nextBlock.getKey(),
            anchorOffset: 0,
            focusKey: nextBlock.getKey(),
            focusOffset: 0,
          });
          this.onChange(EditorState.forceSelection(this.props.editorState, selection));
        } else {
          this.onChange(
            splitBlockWithType(
              this.props.editorState,
              'unstyled',
              selection.getStartOffset(),
              false,
            ),
          );
        }
      }
    }
  }

  onUpArrow(e: SyntheticKeyboardEvent): void {
    if (this.isDisplayingSuggestions()) {
      e.preventDefault();
      const suggestionsLength = this.state.activeSuggestion?.items.length || 0;
      const suggestionIndex =
        this.state.suggestionIndex === suggestionsLength - 1
          ? suggestionsLength - 1
          : this.state.suggestionIndex + 1;
      this.setState({ suggestionIndex });
    }
    this.props.onUpArrow && this.props.onUpArrow(e);
  }

  onEscape(e: SyntheticKeyboardEvent): void {
    if (this.isDisplayingSuggestions()) {
      e.preventDefault();
      this.resetStateAndFocus();
    }
  }

  onTab(e: SyntheticKeyboardEvent): void {
    e.preventDefault();

    this.changeIndent(e, e.shiftKey ? 'decrease' : 'increase');

    if (this.isDisplayingSuggestions()) {
      const result = this.onSuggestionSelected(
        this.state.activeSuggestion?.items[this.state.suggestionIndex],
      );

      if (result) {
        this.resetStateAndFocus();
      }
    }

    this.props.onTab && this.props.onTab();
  }

  changeIndent = (e: SyntheticKeyboardEvent, indentDirection: 'increase' | 'decrease') => {
    const currentBlockType = RichUtils.getCurrentBlockType(this.props.editorState);
    const tabChar = '\u2003';
    const isBlockListType =
      currentBlockType === 'ordered-list-item' || currentBlockType === 'unordered-list-item';
    const maxDepth = 4;

    if (!isBlockListType) {
      if (indentDirection === 'increase') {
        this.onChange(insertText(tabChar, this.props.editorState));
      }

      if (indentDirection === 'decrease') {
        // FIX ME find a way to decrease unstyled/code-block block indentation
        this.onChange(replaceText('', this.props.editorState));
      }
    } else {
      this.onChange(RichUtils.onTab(e, this.props.editorState, maxDepth));
    }
  };

  handlePastedFiles(files: Blob[]): DraftHandleValue {
    if (this.props.onFilePaste) {
      this.props.onFilePaste(files);
      return 'handled';
    }

    return 'not-handled';
  }

  handleBeforeInput(inputString: string, editorState: EditorState): DraftHandleValue {
    const mapping: { [index: string]: string } = {
      '*.': 'unordered-list-item',
      '* ': 'unordered-list-item',
      '- ': 'unordered-list-item',
      '1.': 'ordered-list-item',
    };

    const selection = editorState.getSelection();
    const block = getCurrentBlock(editorState);
    const currentBlockType = block.getType();
    const blockLength = block.getLength();
    const blockText = block.getText();
    const regex = new RegExp('\r|\n', 'gm');

    if (currentBlockType.indexOf('atomic') === 0) {
      return 'not-handled';
    }

    let textToMatch = '';
    let resetBlock = false;
    let insertIndex = 0;

    if (selection.getAnchorOffset() === 1 && blockLength === 1) {
      // first line of the block, reset block with new one
      resetBlock = true;
      textToMatch = blockText[0] + inputString;
    } else {
      // check if we are at a new line
      const matches = [...blockText.matchAll(regex)];

      if (matches.length) {
        const lastMatch = matches[matches.length - 1];
        if (lastMatch) {
          insertIndex = (lastMatch.index ? lastMatch.index : 0) + 1;
          const afterLastSoftLine = blockText.substring(insertIndex, blockText.length);
          textToMatch = `${afterLastSoftLine}${inputString}`;
        }
      }
    }

    if (textToMatch === '') {
      return 'not-handled';
    }

    const blockTo = mapping[textToMatch];

    if (!blockTo) {
      return 'not-handled';
    }

    const finalType = blockTo.split(':');

    if (finalType.length < 1 || finalType.length > 3) {
      return 'not-handled';
    }

    let mappingBlockType = finalType[0];

    if (finalType.length === 1) {
      if (currentBlockType === finalType[0]) {
        return 'not-handled';
      }
    } else if (finalType.length === 2) {
      if (currentBlockType === finalType[1]) {
        return 'not-handled';
      }
      if (currentBlockType === finalType[0]) {
        mappingBlockType = finalType[1];
      }
    } else if (finalType.length === 3) {
      if (currentBlockType === finalType[2]) {
        return 'not-handled';
      }
      if (currentBlockType === finalType[0]) {
        mappingBlockType = finalType[1];
      } else {
        mappingBlockType = finalType[2];
      }
    }

    if (resetBlock) {
      this.onChange(resetBlockWithType(editorState, mappingBlockType, ''));
    } else {
      this.onChange(splitBlockWithType(editorState, mappingBlockType, insertIndex, true));
    }

    return 'handled';
  }

  handleBlockStyle(contentBlock: ContentBlock): string {
    const type = contentBlock.getType();

    if (type === 'blockquote') {
      return 'editor-blockquote';
    }

    if (type === 'code-block') {
      return 'editor-code-block';
    }

    return '';
  }

  shouldHidePlaceHolder(): boolean {
    const contentState = this.props.editorState.getCurrentContent();

    return !contentState.hasText() && contentState.getBlockMap().first().getType() !== 'unstyled';
  }

  shouldScroll() {
    // TODO: rule to be defined
    return true;
  }

  updateVisible(visible: boolean) {
    this.setState(previousState => {
      return previousState.isVisible !== visible ? { isVisible: visible } : null;
    });
  }

  handlePastedText(text: string, _html: string, editorState: EditorState) {
    this.onChange(replaceText(text, editorState));
    return text ? 'handled' : 'not-handled';
  }

  render() {
    return (
      <>
        <OnScreenElement onScreen={this.updateVisible} />
        <div
          className={classNames('bg-zinc-50 border border-zinc-200 rounded-lg py-1 px-3 editor', {
            'scrollable-editor': this.shouldScroll(),
            'editor-hide-placeholder': this.shouldHidePlaceHolder(),
          })}
          onClick={this.focus}
        >
          <Editor
            ref={node => (this.editor = node)}
            editorState={this.props.editorState}
            onChange={this.onChange}
            keyBindingFn={this.keyBindingFn}
            handleKeyCommand={this.handleKeyCommand}
            handleReturn={this.handleReturn}
            handlePastedText={this.handlePastedText}
            handleBeforeInput={this.handleBeforeInput}
            onDownArrow={this.onDownArrow}
            onUpArrow={this.onUpArrow}
            onEscape={this.onEscape}
            onTab={this.onTab}
            handlePastedFiles={this.handlePastedFiles}
            blockStyleFn={this.handleBlockStyle}
            customStyleMap={this.customStyleMap}
            placeholder={this.props.placeholder || ''}
            spellCheck={true}
          />
        </div>
        {this.state.isVisible && this.state.displaySuggestion && this.state.suggestionType && (
          <SuggestionList<any>
            suggestionType={this.state.suggestionType}
            id={this.state.activeSuggestion?.id || ''}
            search={this.state.activeSuggestion?.searchText || ''}
            list={this.state.activeSuggestion?.items}
            loading={this.state.activeSuggestion?.loading || false}
            position={this.state.activeSuggestion ? this.state.activeSuggestion.position : null}
            editorPosition={(this.editor as any)?.editorContainer?.getBoundingClientRect()}
            renderItem={(props: any) => this.renderSuggestion(props, this.state.suggestionType)}
            onSelected={this.onSuggestionSelected}
            selectedIndex={this.state.suggestionIndex}
          />
        )}
      </>
    );
  }
}
