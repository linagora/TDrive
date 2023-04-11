/* eslint-disable @typescript-eslint/no-explicit-any */
export type Thumbnail = {
  index: number;
  id: string;

  type: string;
  size: number;
  width: number;
  height: number;

  url: string;
  full_url?: string;
};


export type MessageFileMetadata = {
  source: 'internal' | 'drive' | string; //Uuid of the corresponding connector
  external_id: string | any;

  name?: string; //Original file name
  mime?: string; //Original file mime
  size?: number; //Original file weight
  thumbnails?: Thumbnail[]; //Url to thumbnail (or set it to undefined if no relevant)
};

/* Blocks objects */

export type Block = { block_id?: string } & (
  | BlockFile
  | BlockActions
  | BlockContext
  | BlockHeader
  | BlockDivider
  | BlockImage
  | BlockInput
  | BlockSection
  | BlockIframe
  | BlockTwacode
);

export type BlockTwacode = {
  type: 'twacode';
  elements: any;
};

export type BlockActions = {
  type: 'actions';
  elements: BlockElement[];
};

export type BlockContext = {
  type: 'context';
  elements: (BlockElementImage | CompositionTextObject | BlockElementProgressBar)[];
};

export type BlockHeader = {
  type: 'header';
  text: CompositionPlainTextObject;
};

export type BlockDivider = {
  type: 'divider';
};

export type BlockFile = {
  type: 'file';
  external_id: string;
  source: string;
  metadata?: MessageFileMetadata;
};

export type BlockImage = BlockElementImage & {
  title?: CompositionPlainTextObject;
};

export type BlockInput = {
  type: 'input';
  label: string;
  element: BlockElement;
  dispatch_action?: boolean;
  hint?: CompositionPlainTextObject;
  optional?: boolean;
};

export type BlockSection = {
  type: 'section';
  text?: CompositionTextObject;
  fields?: CompositionTextObject[];
  accessory?: BlockElement;
};

export type BlockIframe = {
  type: 'iframe';
  iframe_url: string;
  width: number;
  height: number;
};

/* Elements objects */

export type BlockElement =
  | BlockElementImage
  | BlockElementProgressBar
  | BlockElementButton
  | BlockElementCheckboxes
  | BlockElementDatePicker
  | BlockElementMultiselectMenu
  | BlockElementPlaintextInput
  | BlockElementRadioButtonInput
  | BlockElementSelectMenus
  | BlockElementOverflowMenus
  | BlockElementTimePicker;

export type BlockElementImage = {
  type: 'image';
  image_url: string;
  alt_text: string;
  title?: any;
  metadata?: MessageFileMetadata;
};

export type BlockElementProgressBar = {
  type: 'progress_bar';
  value: number; //Between 0 and 100
  title: string;
};

export type BlockElementButton = {
  type: 'button';
  text: CompositionPlainTextObject;
  action_id: string;
  url?: string;
  value?: string;
  style?: 'primary' | 'danger' | 'default';
  confirm?: CompositionConfirmationDialog;
};

export type BlockElementCheckboxes = {
  type: 'checkboxes';
  action_id: string;
  options: CompositionOption[];
  initial_options?: CompositionOption[];
  confirm?: CompositionConfirmationDialog;
};

type BlockElementPlaintextInput = {
  type: 'plain_text_input';
  action_id: string;
  placeholder?: CompositionPlainTextObject;
  initial_value?: string;
  multiline?: boolean;
  min_length?: number;
  max_length?: number;
  dispatch_action_config?: DispatchActionConfiguration;
  readonly?: boolean;
  copiable?: boolean;
};

export type BlockElementRadioButtonInput = {
  type: 'radio_buttons';
  action_id: string;
  options: CompositionOption[];
  initial_option?: CompositionOption;
  confirm?: CompositionConfirmationDialog;
};

export type BlockElementDatePicker = {
  type: 'datepicker';
  action_id: string;
  placeholder?: CompositionPlainTextObject;
  initial_date?: string;
  confirm?: CompositionConfirmationDialog;
};

export type BlockElementTimePicker = {
  type: 'timepicker';
  action_id: string;
  placeholder?: CompositionPlainTextObject;
  initial_time?: string;
  confirm?: CompositionConfirmationDialog;
};

export type BlockElementOverflowMenus = {
  type: 'overflow';
  action_id: string;
  options: CompositionOption[];
  confirm?: CompositionConfirmationDialog;
};

export type BlockElementSelectMenus = {
  type: '';
}; //TODO

export type BlockElementMultiselectMenu = {
  type: any;
}; //TODO

/* Composition objects */

type CompositionTextObject = CompositionPlainTextObject | CompositionMarkdownTextObject;

type CompositionPlainTextObject = {
  type: 'plain_text';
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
};

type CompositionMarkdownTextObject = {
  type: 'mrkdwn';
  text: string;
};

type CompositionConfirmationDialog = {
  title: CompositionPlainTextObject;
  text: CompositionMarkdownTextObject;
  confirm: CompositionPlainTextObject;
  deny: CompositionPlainTextObject;
  style: 'confirm' | 'danger' | 'default';
};

type CompositionOption = {
  text: CompositionPlainTextObject;
  value: string;
  description?: CompositionPlainTextObject;
  url?: string;
};

type DispatchActionConfiguration = {
  trigger_actions_on: ('on_enter_pressed' | 'on_character_entered')[];
};
