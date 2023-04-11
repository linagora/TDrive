/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserType } from 'app/features/users/types/user';
import { FileTypes } from 'features/files/api/file-upload-api-client';

export type ReactionType = { name: string; count: number; users: string[] };

export type ThumbnailType = {
  width?: number; //Thumbnail width (for images only)
  height?: number; //Thumbnail height (for images only)
  id?: string; //Url to thumbnail (or set it to undefined if no relevant)
  index?: number;
  size?: number;
  mime?: string;
  type?: string;
  url: string;
};

export type MessageFileMetadataSource = 'internal' | 'drive' | string;

export type MessageFileType = {
  //Primary key
  id?: string;
  company_id?: string; // optional
  message_id?: string; // optional
  thread_id?: string; // optional

  metadata?: {
    //File information when attached (it can change if edited)
    source?: MessageFileMetadataSource;
    external_id: string | { company_id: string; id: string } | any;
    name?: string; //Original name
    size?: number; //Original weight
    mime?: string;
    thumbnails?: ThumbnailType[];
  };
};

export type FileSearchResult = {
  company_id: string;
  file_id: string;
  thumbnail_url: string;
  filename: string;
  filetype: FileTypes;
  size: number;
  created_at: number;
  message: Message;
  user: UserType;
};

export type Message = {
  created_at?: number;
  id?: string;
  thread_id?: string;
  application_id?: string | null;
  channel_id?: string;
  content?: any;
  creation_date?: number;
  edited?: boolean;
  front_id?: string;
  hidden_data?: any;
  increment_at_time?: number | null;
  message_type?: 0 | 1 | 2;
  modification_date?: number;
  parent_message_id?: string | null;
  pinned?: boolean;
  reactions?: ReactionType[];
  responses_count?: number | null;
  user_id?: string | null;
  user_specific_content?: any;
  cache?: {
    company_id?: string;
    workspace_id?: string;
    channel_id?: string;
  };
  _user_ephemeral?: any;
  _last_modified?: string;
  _user_reaction?: any;
  subtype?:
    | null
    | 'application' //Message from a connector
    | 'deleted' //Message deleted by user
    | 'system';
  files?: MessageFileType[];
  text?: string;
  status?: MessageDeliveryStatusType;
};

export interface MessageExtended extends Message {
  id: string;
  text: string;
  cache: { company_id: string; workspace_id: string; channel_id: string };
  created_at: number;
  user_id: string;
  thread_id: string;
}

export type DeprecatedMessageKeys = {
  parent_message_id?: string | null;
};

export type Thread = {
  company_id: string;
  thread_id: string;
  created_at: number;
  last_activity: number;
  answers: number;
  participants: Participant[];
};

export type Participant = {
  type: 'user' | 'channel';
  id: string;
  company_id: string;
  workspace_id: string | 'direct';
};

export enum NodeMessageType {
  MESSAGE = 'message', // Classic message
  EVENT = 'event', // Hidden events like key changes, or other system events
}

export enum NodeMessageSubType {
  APPLICATION = 'application', // Message from a connector
  DELETED = 'deleted', // Message deleted by user
  SYSTEM = 'system', // Message from system (channel activity)
}

export type EphemeralMessage = {
  id: string; //Identifier of the ephemeral message
  version: string; //Version of ephemeral message (to update the view)
  recipient: string; //User that will see this ephemeral message
  recipient_context_id: string; //Recipient current view/tab/window to send the message to
};

export type NodeMessage = {
  /**
   * @type UUID required
   * Primary key
   */
  id: string;
  /**
   * @type UUID required
   * Primary key
   */
  thread_id: string;

  /**
   * @type UUID required
   * Required
   */
  user_id: string;

  /**
   *  @type  NodeMessageType.MESSAGE | NodeMessageType.EVENT
   */
  type: NodeMessageType;

  /**
   * @type NodeMessageSubType.APPLICATION | NodeMessageSubType.DELETED | NodeMessageSubType.SYSTEM | null
   */
  subtype: NodeMessageSubType | null;

  /**
   * Timestamp in ms
   */
  created_at: number;

  /**
   * Additional information only if message was sent by an application
   */
  application_id: string | null;

  /**
   * Original text typed by user and used in notifications
   * It is parsed as markdown by frontend
   * Most messages will only use this format
   */
  text: string;

  /**
   * @type  JSON [BlockObject]
   * Alternative nested json to replace text (if defined it replaces the text field)
   */
  blocks: any;

  /**
   * @type JSON
   * Hidden custom data for message
   */
  context: any & { _front_id: string }; //Hidden custom data for message

  /**
   * @type JSON
   * @example { "edited_at": 0 }
   */
  edited: { edited_at: number } | null;

  /**
   * @type JSON
   * If message if pinned (or it is undefined)
   * @example { "pinned_by": "uuid", "pinned_at": 0 }
   */
  pinned_info?: { pinned_by: string; pinned_at: number } | null;

  /**
   * @type JSON
   * @example [{"name": "string", "users": ["uuid", "uuid"], "count": 0 }]
   */
  reactions: ReactionType[] | null;

  /**
   * @type JSON
   * Overide message title - Overide message picture
   * @example { "title": "string", "picture": "string" }
   */
  override: { title: string; picture: string } | null;

  files?: MessageFileType[];

  ephemeral: EphemeralMessage | null; //Used for non-persisted messages (like interractive messages)

  users?: UserType[];

  //Used to display loader
  _status?: 'sending' | 'failed' | 'sent' | 'cancelled';

  //Used to display time separator
  _previous_message?: NodeMessage;

  links?: MessageLinkType[];

  quote_message?: QuotedMessageType;

  status?: MessageDeliveryStatusType | null;
};

export type MessageWithReplies = NodeMessage & {
  last_replies: NodeMessage[];
  stats: {
    last_activity: number;
    replies: number;
  };
};

export type MessageLinkType = {
  title: string;
  description: string | undefined;
  domain: string;
  img: string | undefined;
  favicon: string | undefined;
  img_width: number | undefined;
  img_height: number | undefined;
  url: string;
};

export type MessageDeliveryStatusType = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export type MessageSeenType = {
  messages: {
    message_id: string;
    thread_id: string;
  }[];
  channel_id: string;
};

export type QuotedMessageType = NodeMessage & {
  users?: UserType[];
  company_id: string;
  workspace_id: string;
  channel_id: string;
  thread_id: string;
  id: string;
};
