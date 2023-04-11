/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification as antNotification } from 'antd';
import RouterService, { ClientStateType } from '../../router/services/router-service';
import popupManager from 'app/deprecated/popupManager/popupManager';
import emojione from 'emojione';
import React from 'react';
import { X } from 'react-feather';

type DesktopNotification = {
  channel_id: string;
  company_id: string;
  message_id: string;
  thread_id: string;
  user: string;
  workspace_id: string;
  title: string;
  text: string;
};

let inAppNotificationKey = 0;

const callback = (
  notificationObject: (DesktopNotification & { routerState: ClientStateType }) | null,
  inAppNotificationKey?: string,
) => {
  inAppNotificationKey && antNotification.close(inAppNotificationKey);
  popupManager.closeAll();
  if (!notificationObject) {
    return;
  }

  const routerState = notificationObject.routerState;
  const channelId = routerState.channelId;
  const workspaceId = routerState.workspaceId;
  const companyId = routerState.companyId;
  if (notificationObject.workspace_id === 'direct' && notificationObject.company_id === companyId)
    notificationObject.workspace_id = workspaceId || '';
  if (notificationObject.channel_id === channelId) return;

  setTimeout(() => {
    const workspaceId = notificationObject.workspace_id;
    if (workspaceId) {
      RouterService.push(
        RouterService.generateRouteFromState({
          companyId: notificationObject.company_id,
          workspaceId: workspaceId,
          channelId: notificationObject.channel_id,
          threadId: notificationObject.thread_id || '',
        }),
      );
    }
  }, 500);
};

const openNotification = (
  notification: { title: string; text: string },
  newNotification: (DesktopNotification & { routerState: ClientStateType }) | null,
  callback: (
    desktopNotification: (DesktopNotification & { routerState: ClientStateType }) | null,
    id: string,
  ) => void,
) => {
  antNotification.close(inAppNotificationKey.toString());
  inAppNotificationKey++;
  const notificationKey = inAppNotificationKey.toString();
  antNotification.open({
    key: notificationKey,
    message: emojione.shortnameToUnicode(notification.title),
    description: notification.text,
    onClick: () => callback(newNotification, notificationKey),
    closeIcon: <X size={16} />,
  });
};

const notificationsSounds: any = {
  default: new window.Audio('/public/sounds/newnotification.wav'),
  belligerent: new window.Audio('/public/sounds/belligerent.wav'),
  chord: new window.Audio('/public/sounds/chord.wav'),
  polite: new window.Audio('/public/sounds/polite.wav'),
};

export const playNotificationAudio = (sound: string) => {
  let notificationAudio = null;

  if (sound === 'none') {
    notificationAudio = null;
  } else {
    notificationAudio = notificationsSounds[sound];
  }

  if (notificationAudio) {
    try {
      notificationAudio.play();
    } catch (err) {
      console.warn(err);
    }
  }
};

export const pushDesktopNotification = (
  notification: DesktopNotification & { routerState: ClientStateType },
  soundType: 'default' | 'none' | string,
) => {
  if (notification) {
    const title = notification.title || '';
    const message = notification.text || '';

    if (!title) {
      return;
    }

    playNotificationAudio(soundType);

    if (window.document.hasFocus()) {
      openNotification(
        {
          title: title,
          text: message,
        },
        notification,
        callback.bind(this),
      );
    }

    if ('Notification' in window && !window.document.hasFocus()) {
      const n = new Notification(title, {
        body: message,
      });
      n.onclick = () => {
        window.focus();
        callback(notification);
        n.close();
      };
    }
  }
};
