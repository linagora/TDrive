import { EditorState, CompositeDecorator, ContentState } from "draft-js";
import EditorDataParser from "./editor-data-parser";
import { getPlugins } from "./plugins";

class EditorStateService {
  private states: Map<string, EditorState>;

  constructor() {
    this.states = new Map();
  }

  /**
   * Get editor state for given ID is already exists, else create a new one
   * 
   * @param editorId
   * @returns 
   */
  get(editorId: string, options?: { plugins?: Array<string>, initialContent?: ContentState, clearIfExists?: boolean }): EditorState {
    if (!editorId) {
      throw new Error("Editor id is required");
    }

    let editor = this.states.get(editorId);

    if (editor && options?.clearIfExists) {
      editor = this.clear(editorId).states.get(editorId);
    }

    if (!editor) {
      editor = this.createEditor(options?.plugins, options?.initialContent);
      this.states.set(editorId, editor);
    }

    return editor;
  }

  set(editorId: string, editorState: EditorState): this {
    this.states.set(editorId, editorState);

    return this;
  }

  clear(editorId: string): this {
    this.states.delete(editorId);

    return this;
  }

  createEditor(plugins?: Array<string>, initialContent?: ContentState): EditorState {
    const editorPlugins = getPlugins(plugins);
    const decorators = new CompositeDecorator(editorPlugins.map(p => p.decorator));

    if (initialContent) {
      return EditorState.createWithContent(initialContent, decorators);
    }

    return EditorState.createEmpty(decorators);
  }

  getDataParser(plugins?: Array<string>): EditorDataParser {
    return new EditorDataParser(getPlugins(plugins));
  }
}

const instance = new EditorStateService();

export default instance;