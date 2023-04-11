/* eslint-disable @typescript-eslint/ban-types */
export type StyleConfig = {
  /**
   * Draft.js style to apply
   */
  style: string;
  /**
   * Label to display when i18n is not defined
   */
  label: string;
  /**
   * i18n key
   */
  i18n?: string;
  className?: string;
};

export type StyleConfigList = Array<StyleConfig>;

export type GroupName = 'INLINE_STYLE_BUTTONS' | 'BLOCK_ALIGNMENT_BUTTONS' | 'BLOCK_TYPE_BUTTONS' | 'LINK_BUTTONS' | 'BLOCK_TYPE_DROPDOWN' | 'HISTORY_BUTTONS' | 'IMAGE_BUTTON';

export type ToolbarConfig = {
  display: Array<GroupName>;
  extraProps?: Object;
  INLINE_STYLE_BUTTONS: StyleConfigList;
  BLOCK_ALIGNMENT_BUTTONS: StyleConfigList;
  BLOCK_TYPE_DROPDOWN: StyleConfigList;
  BLOCK_TYPE_BUTTONS: StyleConfigList;
};

export const INLINE_STYLE_BUTTONS: StyleConfigList = [
  { label: 'Bold', style: 'BOLD', i18n: 'components.richtexteditor.toolbar.bold' },
  { label: 'Underline', style: 'UNDERLINE', i18n: 'components.richtexteditor.toolbar.underline' },
  { label: 'Italic', style: 'ITALIC', i18n: 'components.richtexteditor.toolbar.italic' },
  { label: 'Strikethrough', style: 'STRIKETHROUGH', i18n: 'components.richtexteditor.toolbar.strikethrough' },
  { label: 'Code', style: 'CODE', i18n: 'components.richtexteditor.toolbar.code' },
];

export const BLOCK_ALIGNMENT_BUTTONS: StyleConfigList = [
  {label: 'Align Left', style: 'ALIGN_LEFT'},
  {label: 'Align Center', style: 'ALIGN_CENTER'},
  {label: 'Align Right', style: 'ALIGN_RIGHT'},
  {label: 'Align Justify', style: 'ALIGN_JUSTIFY'},
];

export const BLOCK_TYPE_DROPDOWN: StyleConfigList = [
  {label: 'Normal', style: 'unstyled'},
  {label: 'Heading Large', style: 'header-one'},
  {label: 'Heading Medium', style: 'header-two'},
  {label: 'Heading Small', style: 'header-three'},
  {label: 'Code Block', style: 'code-block'},
];
export const BLOCK_TYPE_BUTTONS: StyleConfigList = [
  {label: 'UL', style: 'unordered-list-item', i18n: 'components.richtexteditor.toolbar.unordered-list'},
  {label: 'OL', style: 'ordered-list-item', i18n: 'components.richtexteditor.toolbar.ordered-list'},
  {label: 'Blockquote', style: 'blockquote', i18n: 'components.richtexteditor.toolbar.blockquote'},
  {label: 'Code Block', style: 'code-block', i18n: 'components.richtexteditor.toolbar.code-block'},
];

const EditorToolbarConfig: ToolbarConfig = {
  //display: ['INLINE_STYLE_BUTTONS', 'BLOCK_ALIGNMENT_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'IMAGE_BUTTON', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
  display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS'],
  INLINE_STYLE_BUTTONS,
  BLOCK_ALIGNMENT_BUTTONS,
  BLOCK_TYPE_DROPDOWN,
  BLOCK_TYPE_BUTTONS,
};

export default EditorToolbarConfig;