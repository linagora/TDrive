export type PushConfiguration = {
  type: "fcm" | null;
  fcm: {
    endpoint: string;
    key: string;
  };
};

export type PushMessageOptions = {
  notification_data?: any;
  collapse_key?: string;
};

export type PushMessageNotification = {
  title: string;
  body: string;
  sound?: string;
  badge?: number;
  click_action?: "FLUTTER_NOTIFICATION_CLICK";
};
