/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from 'app/features/applications/types/application';
import Observable from 'app/deprecated/Observable/Observable';
import _ from 'lodash';

export type ViewTypes =
  | 'channel'
  | 'channel_thread'
  | 'channel_pinned'
  | 'channel_files'
  | 'application'
  | '';

export type ViewConfiguration = {
  app?: Partial<Application>; //In depreciated app is used
  context:
    | {
        type: 'application' | 'channel';
        tabId?: string;
        configuration?: object;
      }
    | any
    | null;
  hasTabs?: boolean;
};

const defaultConfiguration: ViewConfiguration = {
  app: {
    identity: {
      code: 'messages',
      name: '',
      icon: '',
      description: '',
      website: '',
      categories: [],
      compatibility: [],
    },
  },
  context: null,
  hasTabs: false,
};

export default class AppViewService extends Observable {
  private id = '';
  private configuration: ViewConfiguration = defaultConfiguration;

  public getViewType(): ViewTypes {
    return '';
  }

  public getId() {
    return this.id;
  }

  public getConfiguration() {
    return this.configuration;
  }

  public select(id: string, configuration?: ViewConfiguration) {
    this.id = id;
    this.configuration = _.assign(_.clone(defaultConfiguration), configuration);
    this.notify();
  }
}
