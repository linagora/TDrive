import Languages from 'app/features/global/services/languages-service';
import * as Text from '@atoms/text';
import { ToasterService as Toaster } from 'app/features/global/services/toaster-service';
import UserAPIClient from 'app/features/users/api/user-api-client';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import Radio from 'components/inputs/radio.jsx';

export type preferencesType = Record<string, unknown>;
export type AssistantPreferencesType = {
  user_id: string;
  company_id: string;
  workspace_id: string;
  preferences: preferencesType;
};

let locked = false;

export default () => {
  const { user, refresh } = useCurrentUser();

  const setPreferences = async (value: 'all' | 'nothing' | 'metadata') => {
    if (locked) return;
    locked = true;
    try {
      await UserAPIClient.setUserPreferences({
        knowledge_graph: value,
      });
      await refresh();
      Toaster.success(Languages.t('scenes.apps.account.assistant.success'));
    } catch (err) {
      Toaster.error('' + err);
    }
    locked = false;
  };

  return (
    <>
      <div className="title">{Languages.t('scenes.apps.account.assistant.title')}</div>

      <Text.Info>{Languages.t('scenes.apps.account.assistant.description')}</Text.Info>

      <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
        <Radio
          small
          label={Languages.t('scenes.apps.account.assistant.share.nothing')}
          value={user?.preferences?.knowledge_graph === 'nothing'}
          onChange={() => {
            setPreferences('nothing');
          }}
        />
        <br />

        <Radio
          small
          label={Languages.t('scenes.apps.account.assistant.share.metadata')}
          value={
            !user?.preferences?.knowledge_graph || user?.preferences?.knowledge_graph === 'metadata'
          }
          onChange={() => {
            setPreferences('metadata');
          }}
        />
        <br />

        <Radio
          small
          label={Languages.t('scenes.apps.account.assistant.share.all')}
          value={user?.preferences?.knowledge_graph === 'all'}
          onChange={() => {
            setPreferences('all');
          }}
        />
      </div>
    </>
  );
};
