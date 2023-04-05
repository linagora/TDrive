import { Application } from '../types/application';

type DefaultApplicationEntries = Partial<Application>;

const defaultApplicationPayload: Application = {
  id: '',
  company_id: '',
  identity: {
    code: '',
    name: '',
    icon: '',
    description: 'This is a cool application',
    website: '',
    categories: [],
    compatibility: [],
  },
  api: {
    hooks_url: '',
    allowed_ips: '*',
  },
  access: {
    read: [],
    write: [],
    delete: [],
    hooks: [],
  },
  display: {
    tdrive: {
      version: 1,

      files: {
        editor: {
          preview_url: '',
          edition_url: '',
          extensions: [],

          // if file was created by the app, then the app is able to edit with or without extension
          empty_files: [],
        },
        actions: [],
      },

      //Chat plugin
      chat: {
        input: undefined,
        commands: [],
        actions: [],
      },

      //Allow app to appear as a bot user in direct chat
      direct: undefined,

      //Display app as a standalone application in a tab
      tab: { url: '' },

      //Display app as a standalone application on the left bar
      standalone: { url: '' },

      //Define where the app can be configured from
      configuration: [],
    },
  },
  publication: {
    requested: false, //Publication requested
  },
  stats: {
    created_at: 0,
    updated_at: 0,
    version: 0,
  },
};

export const buildDefaultApplicationPayload = (
  partials?: DefaultApplicationEntries,
): Application => ({
  ...defaultApplicationPayload,
  ...partials,
});

export const getApplicationIdentityCode = (value: string) => {
  value = value || '';
  value = value.toLocaleLowerCase();
  value = value.replace(/[^a-z0-9]/g, '_');
  value = value.replace(/_+/g, '_');
  value = value.replace(/^_+/g, '');
  return value;
};
