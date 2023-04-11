import React, { useState, useEffect } from 'react';
import { isEqual } from 'lodash';
import Languages from 'app/features/global/services/languages-service';
import ButtonWithTimeout from 'components/buttons/button-with-timeout.jsx';
import Attribute from 'components/parameters/attribute.jsx';
import Switch from 'components/inputs/switch';
import Radio from 'components/inputs/radio.jsx';

import { preferencesType } from 'app/features/users/types/notification-preferences-type';
import { UseNotificationPreferences } from 'app/features/notifications-preferences/hooks/use-notifications-preference-hook';
import { playNotificationAudio } from 'app/features/users/services/push-desktop-notification';

export default () => {
  const { save, notifsPreferences } = UseNotificationPreferences();
  const [newPreferences, setNewPreferences] = useState<preferencesType>();

  useEffect(() => {
    if (notifsPreferences && notifsPreferences.length) {
      setNewPreferences(
        notifsPreferences[0]?.preferences || {
          highlight_words: [],
          night_break: { enable: false, from: 0, to: 0 },
          private_message_content: false,
          mobile_notifications: 'always',
          email_notifications_delay: 15,
          deactivate_notifications_until: 0,
          notification_sound: 'default',
        },
      );
    }
  }, [notifsPreferences]);

  const saveNewPreferences = async (preferences: preferencesType) => {
    save(preferences);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateTimeOptions = () => {
    const options = [];
    for (let value = 0; value < 24; value += 0.5) {
      const text = ~~value + ':' + ((value * 2) % 2 === 0 ? '00' : '30');
      options.push(
        <option key={value} value={value}>
          {text}
        </option>,
      );
    }
    return options;
  };

  if (!newPreferences) {
    return <div></div>;
  }

  return (
    <>
      <div className="title">{Languages.t('scenes.apps.account.notifications.title')}</div>
      <div className="group_section">
        <div className="subtitle">
          {Languages.t('scenes.app.popup.userparameter.pages.frequency_notif_subtitle')}
        </div>
        {/* <Attribute
          label={Languages.t('scenes.apps.account.notifications.keywords_subtitle')}
          description={Languages.t(
            'scenes.app.popup.userparameter.pages.keywords_notif_description',
          )}
        >
          <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
            <Input
              value={newPreferences.highlight_words.join(', ')}
              placeholder={Languages.t('scenes.apps.account.notifications.keywords_placeholder')}
              className="bottom-margin"
              size="large"
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                setNewPreferences({
                  ...newPreferences,
                  highlight_words: evt.target.value.split(', '),
                });
              }}
            ></Input>
          </div>
        </Attribute> */}
        {/* <Attribute
          label={Languages.t('scenes.app.popup.userparameter.pages.no_night_disturbing_label')}
          description={Languages.t(
            'scenes.app.popup.userparameter.pages.no_disturbing_notif_period_description',
          )}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Switch
              // TODO: Change the title and add the traduction
              label={'Enable night feature'}
              checked={newPreferences.night_break.enable}
              onChange={(checked: boolean) => {
                setNewPreferences({
                  ...newPreferences,
                  night_break: {
                    ...newPreferences.night_break,
                    enable: checked,
                  },
                });
              }}
            />
            <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
              <div className="text">
                {Languages.t('scenes.apps.account.notifications.disturb_option_a')}
                <select
                  id="after"
                  className="select_inline"
                  style={{ width: '80px', display: 'inline-block', margin: '0 10px' }}
                  value={
                    NotificationParameters.transform_period(
                      newPreferences.night_break.from,
                      newPreferences.night_break.to,
                      -new Date().getTimezoneOffset() / 60,
                    )[0]
                  }
                  onChange={(evt) => {
                    setNewPreferences({
                      ...newPreferences,
                      night_break: {
                        ...newPreferences.night_break,
                        from: NotificationParameters.transform_period(
                          evt.target.value,
                          newPreferences.night_break.to,
                          new Date().getTimezoneOffset() / 60,
                        )[0],
                      },
                    });
                  }}
                >
                  {generateTimeOptions()}
                </select>
                {Languages.t('scenes.apps.account.notifications.disturb_option_b')}
                <select
                  id="before"
                  className="select_inline"
                  style={{ width: '80px', display: 'inline-block', margin: '0 10px' }}
                  value={
                    NotificationParameters.transform_period(
                      newPreferences.night_break.from,
                      newPreferences.night_break.to,
                      -new Date().getTimezoneOffset() / 60,
                    )[1]
                  }
                  onChange={(evt) => {
                    setNewPreferences({
                      ...newPreferences,
                      night_break: {
                        ...newPreferences.night_break,
                        to: NotificationParameters.transform_period(
                          newPreferences.night_break.from,
                          evt.target.value,
                          new Date().getTimezoneOffset() / 60,
                        )[1],
                      },
                    });
                  }}
                >
                  {generateTimeOptions()}
                </select>
                {Languages.t('scenes.apps.account.notifications.disturb_option_c')}
              </div>
            </div>
          </div>
        </Attribute> */}
        <Attribute
          label={Languages.t('scenes.apps.account.notifications.devices_subtitle')}
          description={Languages.t(
            'scenes.app.popup.userparameter.pages.frequency_notif_configuration_description',
          )}
        >
          <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
            <Radio
              small
              label={Languages.t('scenes.apps.account.notifications.devices_option_ever')}
              value={newPreferences.mobile_notifications === 'always'}
              onChange={() => {
                setNewPreferences({
                  ...newPreferences,
                  mobile_notifications: 'always',
                });
              }}
            />
            {/*
            <br />

            <Radio
              small
              label={Languages.t('scenes.apps.account.notifications.devices_option_inactive')}
              value={newPreferences.mobile_notifications === 'when_inactive'}
              onChange={() => {
                setNewPreferences({
                  ...newPreferences,
                  mobile_notifications: 'when_inactive',
                });
              }}
            />
            <br /> */}

            <Radio
              small
              label={Languages.t('scenes.apps.account.notifications.devices_option_never')}
              value={newPreferences.mobile_notifications === 'never'}
              onChange={() => {
                setNewPreferences({
                  ...newPreferences,
                  mobile_notifications: 'never',
                });
              }}
            />
          </div>
        </Attribute>
        <Attribute
          label={Languages.t('scenes.apps.account.notifications.mail_subtitle')}
          description={Languages.t(
            'scenes.app.popup.userparameter.pages.mail_frequency_notif_configuration_description',
          )}
        >
          <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
            {/* TODO: Add an explanatory message */}
            <div className="parameters_form">
              <select
                value={newPreferences.email_notifications_delay}
                onChange={evt => {
                  setNewPreferences({
                    ...newPreferences,
                    email_notifications_delay: parseInt((evt.target as HTMLSelectElement).value),
                  });
                }}
              >
                <option value="0">
                  {Languages.t('scenes.app.popup.userparameter.pages.email_notif_delay_never')}
                </option>
                <option value="15">
                  {Languages.t(
                    'scenes.app.popup.userparameter.pages.email_notif_delay_quarter_hour',
                  )}
                </option>
                <option value="60">
                  {Languages.t('scenes.app.popup.userparameter.pages.email_notif_delay_one_hour')}
                </option>
                <option value="1440">
                  {Languages.t('scenes.app.popup.userparameter.pages.email_notif_delay_one_day')}
                </option>
              </select>
            </div>
          </div>
        </Attribute>
        {/* TODO: Add DE and RU traduction and implement the feature */}
        <Attribute
          label={Languages.t('scenes.apps.account.notifications.sound')}
          description={Languages.t('scenes.apps.account.notifications.sound')}
        >
          <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
            {/* TODO: Add an explanatory message */}
            <div className="parameters_form">
              <select
                value={newPreferences.notification_sound}
                onChange={evt => {
                  playNotificationAudio(evt.target.value);
                  setNewPreferences({
                    ...newPreferences,
                    notification_sound: (evt.target as HTMLSelectElement).value,
                  });
                }}
              >
                <option value="none">
                  {Languages.t('scenes.app.popup.userparameter.pages.notification_sound.none')}
                </option>
                <option value="default">
                  {Languages.t('scenes.app.popup.userparameter.pages.notification_sound.defaut')}
                </option>
                <option value="belligerent">Belligerent</option>
                <option value="chord">Chord</option>
                <option value="polite">Polite</option>
              </select>
            </div>
          </div>
        </Attribute>
      </div>
      <div className="group_section">
        <div className="subtitle">
          {Languages.t('scenes.apps.account.notifications.privacy_subtitle')}
        </div>
        <Attribute
          label={Languages.t('scenes.app.popup.userparameter.pages.notif_content_label')}
          description={Languages.t(
            'scenes.app.popup.userparameter.pages.private_message_content.show',
          )}
        >
          <Switch
            label={Languages.t(
              // TODO: Add DE and RU translation
              newPreferences.private_message_content
                ? 'scenes.app.popup.userparameter.pages.private_message_content.hide'
                : 'scenes.app.popup.userparameter.pages.private_message_content.show',
            )}
            checked={newPreferences.private_message_content}
            onChange={(checked: boolean) => {
              setNewPreferences({
                ...newPreferences,
                private_message_content: checked,
              });
            }}
          />
        </Attribute>
      </div>
      <div style={{ textAlign: 'right' }}>
        <ButtonWithTimeout
          className="small buttonValidation"
          disabled={isEqual(newPreferences, notifsPreferences[0].preferences)}
          onClick={() => saveNewPreferences(newPreferences)}
          value={Languages.t('general.update')}
        />
      </div>
    </>
  );
};
