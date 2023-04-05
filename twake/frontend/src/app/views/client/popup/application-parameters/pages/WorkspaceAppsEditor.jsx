import React, { useEffect, useState } from 'react';
import Api from 'app/features/global/framework/api-service';

import Languages from 'app/features/global/services/languages-service';

import Icon from 'app/components/icon/icon';
import Emojione from 'components/emojione/emojione';
import Attribute from 'components/parameters/attribute';
import Input from 'components/inputs/input';
import TagPicker from 'components/tag-picker/tag-picker';
import AutoHeight from 'components/auto-height/auto-height';
import InputWithClipBoard from 'components/input-with-clip-board/input-with-clip-board';
import { getCompanyApplication as getApplication } from 'app/features/applications/state/company-applications';

import './pages.scss';
import WorkspacesApp from 'app/deprecated/workspaces/workspaces_apps.jsx';
import InlineTagPicker from 'components/inline-tag-picker/inline-tag-picker';
import Switch from 'components/inputs/switch';
import ButtonWithTimeout from 'components/buttons/button-with-timeout';

import _ from 'lodash';

export default props => {
  const [originalApplication, setOriginalApplication] = useState({});

  const [application, _setApplication] = useState({});
  const setApplication = data => _setApplication(_.cloneDeep(data));

  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [displayJsonError, setDisplayJsonError] = useState(false);
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState(false);

  const [identity, setIdentity] = useState({});

  let api_key_timeout = null;
  const fetchData = async () => {
    const res = await Api.get(`/internal/services/applications/v1/applications/${props.appId}`);
    setLoading(false);
    if (!res.resource) {
      console.error(res);
      return;
    }

    console.log('APPLICATION', res.resource);

    res.resource.categories = [];
    res.resource.available_categories = [1, 2, 3];

    res.resource.capabilities = [];
    res.resource.available_capabilities = [1, 2, 3];

    res.resource.privileges = [];
    res.resource.available_privileges = [1, 2, 3];

    res.resource.hooks = [];
    res.resource.available_hooks = [1, 2, 3];

    setApplication(res.resource);
    setOriginalApplication(res.resource);

    setIdentity(res.resource.identity);
  };
  useEffect(() => {
    if (props.appId && !application.id) {
      fetchData();
    }
  }, []);

  //
  //
  // // this.state = {
  // //   id: props.appId,
  // //   application: {},
  // //   show_api_key: false,
  // // };
  //
  // const saveApp = () => {
  //   var saveApp = () => {
  //     this.setState({ loading: true, error: false, error_code: false });
  //
  //     var data = {
  //       application: this.state.application,
  //       workspace_id: workspaceService.currentWorkspaceId,
  //     };
  //
  //     Api.post('/ajax/market/app/update', data, res => {
  //       if (res.data && res.data.id) {
  //         Collections.get('applications').completeObject(res.data);
  //
  //         this.props.exit();
  //       } else {
  //         if (res.errors.indexOf('code_used') >= 0) {
  //           this.setState({ loading: false, error_code: true });
  //         } else {
  //           this.setState({ loading: false, error: true });
  //         }
  //       }
  //     });
  //   };
  //
  //   if (this.state.application.install_count > 0) {
  //     AlertManager.confirm(
  //       () => {
  //         saveApp();
  //       },
  //       null,
  //       {
  //         text: Languages.t(
  //           'scenes.app.popup.appsparameters.pages.app_update',
  //           [this.state.application.name, this.state.application.install_count || 0],
  //           "Mettre à jour l'application $1 (l'application est utilisée $2 fois.)",
  //         ),
  //       },
  //     );
  //   } else {
  //     saveApp();
  //   }
  // }
  //
  // const removeApp = () => {
  //   AlertManager.confirm(
  //     () => {
  //       this.setState({ loading: true, error: false });
  //
  //       var data = {
  //         application_id: this.state.application.id,
  //       };
  //
  //       Api.post('/ajax/market/app/remove', data, res => {
  //         if (res.data && !res.errors.length) {
  //           Collections.get('applications').removeObject(this.state.application.front_id);
  //           this.props.exit();
  //         } else {
  //           this.setState({ loading: false, error: true });
  //         }
  //       });
  //     },
  //     null,
  //     {
  //       text: Languages.t(
  //         'scenes.app.popup.appsparameters.pages.remove_app',
  //         [this.state.application.name],
  //         "Supprimer l'application $1 définitivement.",
  //       ),
  //     },
  //   );
  // }
  //
  const convertToSimpleName = value => {
    value = value || '';
    value = value.toLocaleLowerCase();
    value = value.replace(/[^a-z0-9]/g, '_');
    value = value.replace(/_+/g, '_');
    value = value.replace(/^_+/g, '');
    return value;
  };
  //
  //
  //   if (this.state.application.id !== this.state.id) {
  //     // eslint-disable-next-line react/no-direct-mutation-state
  //     this.state.application = JSON.parse(JSON.stringify(getApplication(this.state.id) || {}));
  //   }
  //
  //   var isNew = false;
  //   var application = this.state.application;
  //
  //
  //   if (!application || !application.id) {
  //     isNew = true;
  //   }
  //
  //   var workspace_id = workspaceService.currentWorkspaceId;
  //   var workspace = Collections.get('workspaces').find(workspace_id);
  //   // eslint-disable-next-line no-unused-vars
  //   var group = Collections.get('groups').find(workspace?.group?.id || workspace.company_id);
  //
  //   if (isNew) {
  //     return (
  //       <WorkspaceAppsCreator exit={this.props.exit} openApp={id => this.setState({ id: id })} />
  //     );
  //   }
  //
  //   var original_app = getApplication(props.appId);
  //   console.log(original_app)

  //
  var public_lock = false; // TODO
  // var public_lock = original_app.public || original_app.is_available_to_public;
  //
  return (
    (application?.id && (
      <div>
        <div className="_fade_in _app_editor">
          <div className="title">
            <Icon
              className="app_icon"
              style={{ fontSize: '24px' }}
              type={WorkspacesApp.getAppIcon(application)}
            />
            {application.name}
          </div>

          <div className="smalltext" style={{ opacity: 1 }}>
            <Emojione type={':exploding_head:'} /> If you do not know how to fill these, go to{' '}
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href="https://doc.tdrive.app" target="_blank" rel="noreferrer">
              the Tdrive API documentation
            </a>{' '}
            !
          </div>

          {public_lock && (
            <div className="smalltext" style={{ opacity: 1 }}>
              <Emojione type={':warning:'} />{' '}
              {Languages.t(
                'scenes.app.popup.appsparameters.pages.alert_published_app',
                [],
                'Votre application est publiée, vous ne pouvez pas la modifier.',
              )}
            </div>
          )}

          <div className="group_section">
            <Attribute
              label={Languages.t('scenes.app.popup.appsparameters.pages._app_identity')}
              description={Languages.t('scenes.app.popup.appsparameters.pages.modify_public_data')}
            >
              <div className="parameters_form" style={{ maxWidth: 'none' }}>
                <div className="label for_input">
                  {Languages.t('scenes.app.popup.appsparameters.pages.app_name_label')}
                </div>
                <Input
                  placeholder={Languages.t(
                    'scenes.app.popup.appsparameters.pages.amazing_app_name',
                  )}
                  type="text"
                  disabled={loading || public_lock}
                  value={application.identity.name}
                  onChange={ev => {
                    application.identity.name = ev.target.value;
                    setApplication(application);
                  }}
                />

                <div className="label for_input">
                  {Languages.t('scenes.app.popup.appsparameters.pages.grp_section_surname_label')}
                </div>
                <div className="smalltext" style={{ paddingBottom: 0 }}>
                  {Languages.t('scenes.app.popup.appsparameters.pages.string_information')}
                </div>
                <Input
                  placeholder={'my_amazing_app'}
                  type="text"
                  disabled={loading || public_lock}
                  value={application?.identity?.code}
                  onChange={ev => {
                    application.identity.code = convertToSimpleName(ev.target.value);
                    setApplication(application);
                  }}
                />
                {error && (
                  <div className="smalltext error" style={{ opacity: 1 }}>
                    {Languages.t('scenes.app.popup.appsparameters.pages.grp_section_name-error')}
                  </div>
                )}

                <div className="label for_input">
                  {Languages.t('scenes.app.popup.appsparameters.pages.icon', 'icon')}
                </div>
                <div className="smalltext" style={{ paddingBottom: 0 }}>
                  {Languages.t('scenes.app.popup.appsparameters.pages.optimal_format')}
                </div>
                <Input
                  placeholder={'https://domain.com/my_icon.png'}
                  type="text"
                  disabled={loading || public_lock}
                  value={application.identity.icon}
                  onChange={ev => {
                    application.identity.icon = ev.target.value;
                    setApplication(application);
                  }}
                />
                {/*
              <TagPicker
                disabled={loading || public_lock}
                canCreate={false}
                inline
                data={application.available_categories.map(item => {
                  return { name: item, id: item };
                })}
                value={(application.categories || []).map(item => {
                  return { name: item, id: item };
                })}
                onChange={values => {
                  application.categories = values.map(item => item.name);
                }}
              />
              */}

                <div className="label for_input">
                  {Languages.t('scenes.app.popup.appsparameters.pages.website_label')}
                </div>
                <Input
                  placeholder={'https://domain.com/'}
                  type="text"
                  disabled={loading || public_lock}
                  value={application.identity.website}
                  onChange={ev => {
                    application.identity.website = ev.target.value;
                    setApplication(application);
                  }}
                />

                <div className="label for_input">
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.description_label',
                    [],
                    'Description',
                  )}
                </div>
                <AutoHeight
                  placeholder={Languages.t(
                    'scenes.app.popup.appsparameters.pages.description_label',
                    [],
                    'Description',
                  )}
                  disabled={loading || public_lock}
                  onChange={evt => {
                    application.identity.description = evt.target.value;
                    setApplication(application);
                  }}
                >
                  {application.identity.description}
                </AutoHeight>
              </div>
            </Attribute>
          </div>

          <div className="group_section">
            <Attribute
              label={Languages.t(
                'scenes.app.popup.appsparameters.pages.api_parameters_label',
                [],
                "Paramètres de l'API",
              )}
              description={Languages.t(
                'scenes.app.popup.appsparameters.pages.api_data_description',
                [],
                "Données utiles pour l'API Tdrive.",
              )}
            >
              <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
                <div className="label for_input">
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.public_login_label',
                    [],
                    'Identifiant public',
                  )}
                </div>
                <InputWithClipBoard disabled={true} value={application.api_id} />

                <div className="label for_input">
                  Private key
                  <a
                    style={{ float: 'inherit' }}
                    onClick={() => {
                      clearTimeout(api_key_timeout || '');
                      setShowApiKey(true);
                      api_key_timeout = setTimeout(() => {
                        setShowApiKey(false);
                      }, 5000);
                    }}
                  >
                    Show
                  </a>
                </div>
                <InputWithClipBoard
                  disabled={true}
                  hideBtn={!showApiKey}
                  value={showApiKey ? application.api_key : '••••••••••••••'}
                />

                <div className="label for_input">
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.url_reception_events_label',
                    [],
                    'Url de reception des évènements',
                  )}
                </div>
                <Input
                  placeholder={'https://domain.com/api/tdrive/events'}
                  type="text"
                  disabled={loading}
                  value={application.api_event_url}
                  onChange={ev => {
                    application.api_event_url = ev.target.value;
                  }}
                />

                <div className="label for_input">
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.autorised_ip_adresses_label',
                    [],
                    'Adresses IP autorisée',
                  )}
                </div>
                <div className="smalltext" style={{ paddingBottom: 0 }}>
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.filter_information',
                    [],
                    "Ce filtre permet de limiter l'utilisation de votre clé API aux serveurs de votre connecteur uniquement.",
                  )}
                  <br />
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.allowed_ip_adresses_method',
                    [],
                    'Utilisez * en développement pour autorisé toutes les adresses IP.',
                  )}
                </div>
                <Input
                  placeholder={'ip1, ip2, ip3'}
                  type="text"
                  disabled={loading}
                  value={application.api_allowed_ips}
                  onChange={ev => {
                    application.api_allowed_ips = ev.target.value;
                  }}
                />
              </div>
            </Attribute>
          </div>

          <div className="group_section">
            <Attribute
              label={Languages.t(
                'scenes.app.popup.appsparameters.pages.displayed_parameters_label',
                [],
                "Paramètres d'affichage",
              )}
              description={Languages.t(
                'scenes.app.popup.appsparameters.pages.dispalyed_parameters_description',
                [],
                "Permet de définir l'endroit où votre application sera visible.",
              )}
            >
              <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 0 }}>
                <div className="label for_input">
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.configuration_label',
                    [],
                    'Configuration',
                  )}
                </div>
                <div className="smalltext" style={{ paddingBottom: 0, opacity: 1 }}>
                  <Emojione type={':information_source:'} />{' '}
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.json_configuration_information',
                    [],
                    'Rendez-vous sur la documentation afin de générer votre configuration au format JSON.',
                  )}
                </div>
                <AutoHeight
                  placeholder={'{JSON}'}
                  className={displayJsonError ? 'error' : ''}
                  disabled={loading || public_lock}
                  onChange={evt => {
                    try {
                      application.display = JSON.parse(evt.target.value);
                      setDisplayJsonError(false);
                    } catch (e) {
                      application.display = evt.target.value;
                      setDisplayJsonError(true);
                    }
                  }}
                >
                  {typeof application.display == 'object'
                    ? JSON.stringify(application.display, null, 2)
                    : application.display}
                </AutoHeight>
              </div>
            </Attribute>
          </div>
          {/*
        <div className="group_section">
          <Attribute
            label={Languages.t(
              'scenes.app.popup.appsparameters.pages.app_privileges_label',
              [],
              "Privilèges de l'application",
            )}
            description={Languages.t(
              'scenes.app.popup.appsparameters.pages.app_privileges_information',
              [],
              'Permet de définir ce que votre application peut modifier et lire.',
            )}
          >
            <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 0 }}>
              <div className="label for_input" style={{ marginBottom: 5 }}>
                {Languages.t(
                  'scenes.app.popup.appsparameters.pages.write_privileges_label',
                  [],
                  'Privilèges en écriture',
                )}
              </div>
              <InlineTagPicker
                available={application.available_capabilities}
                value={application.capabilities}
                onChange={items => {
                  application.capabilities = items;
                }}
              />
              <div className="label for_input" style={{ marginBottom: 5 }}>
                {Languages.t(
                  'scenes.app.popup.appsparameters.pages.read_privileges_label',
                  [],
                  'Privilèges en lecture',
                )}
              </div>
              <InlineTagPicker
                available={application.available_privileges}
                value={application.privileges}
                onChange={items => {
                  application.privileges = items;
                }}
              />
              <div className="label for_input" style={{ marginBottom: 5 }}>
                Hooks
              </div>
              <InlineTagPicker
                available={application.available_hooks}
                value={application.hooks}
                onChange={items => {
                  application.hooks = items;
                }}
              />
            </div>
          </Attribute>
        </div>

        <div className="group_section">
          <Attribute
            label={Languages.t(
              'scenes.app.popup.appsparameters.pages.publication_label',
              [],
              'Publication',
            )}
            description={Languages.t(
              'scenes.app.popup.appsparameters.pages.publication_description',
              [],
              'Déterminez la visibilité de votre application.',
            )}
          >
            <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
              <div className="smalltext" style={{ paddingTop: 0 }}>
                {Languages.t(
                  'scenes.app.popup.appsparameters.pages.parameters_form_small_text',
                  [],
                  "L'application non publiée ne fonctionnera que dans votre entreprise, si vous souhaitez la rendre disponible à tous les utilisateurs de Tdrive activez cette option.",
                )}
              </div>

              {originalApplication.public && !originalApplication.is_available_to_public && (
                <div className="smalltext" style={{ paddingTop: 0, opacity: 1 }}>
                  <Emojione type={':information_source:'} />{' '}
                  {Languages.t(
                    'scenes.app.popup.appsparameters.pages.available_publication_alert',
                    [],
                    'La publication de votre application est actuellement en attente de validation par les équipes de Tdrive.',
                  )}
                </div>
              )}

              <Switch
                label={Languages.t(
                  'scenes.app.popup.appsparameters.pages.publish_app_label',
                  [],
                  "Publier l'application",
                )}
                checked={application.public}
                onChange={value => {
                  application.public = value;
                }}
              />
            </div>
          </Attribute>
        </div>

        <div className="group_section">
          <Attribute
            label={Languages.t(
              'scenes.app.popup.appsparameters.pages.danger_zone_label',
              [],
              'Zone dangereuse',
            )}
            description={Languages.t(
              'scenes.app.popup.appsparameters.pages.danger_zone_description',
              [],
              "Supprimez l'application.",
            )}
          >
            <div className="parameters_form" style={{ maxWidth: 'none', paddingTop: 10 }}>
              <div className="smalltext" style={{ padding: 0 }}>
                {Languages.t(
                  'scenes.app.popup.appsparameters.pages.danger_zone_small_text',
                  [],
                  'Vous ne pouvez pas supprimer cette application si elle est publiée.',
                )}
              </div>

              <ButtonWithTimeout
                className="small buttonValidation danger"
                value={Languages.t(
                  'scenes.app.popup.appsparameters.pages.remove_app_button',
                  [],
                  "Supprimer l'application",
                )}
                disabled={loading || public_lock}
                loading={loading}
                onClick={() => {
                  removeApp();
                }}
              />
            </div>
          </Attribute>
        </div>

        <div className="group_section">
          {errorCode && (
            <div className="smalltext error" style={{ opacity: 1 }}>
              {Languages.t(
                'scenes.app.popup.appsparameters.pages.error_app_code_message',
                [],
                'Le nom simplifié de votre application est déjà utilisé par une autre application, veuillez le changer.',
              )}
            </div>
          )}

          {error && (
            <div className="smalltext error" style={{ opacity: 1 }}>
              {Languages.t(
                'scenes.app.popup.appsparameters.pages.error_app_update_message',
                [],
                "Une erreur s'est produite lors de la mise à jour de l'application.",
              )}
            </div>
          )}

          <ButtonWithTimeout
            className="small buttonGoBack secondary"
            value={Languages.t('general.back', [], 'Retour')}
            disabled={loading}
            onClick={() => {
              props.exit();
            }}
          />

          <ButtonWithTimeout
            className="small buttonValidation"
            value={Languages.t(
              'scenes.app.popup.appsparameters.pages.update_button',
              [],
              'Mettre à jour',
            )}
            disabled={loading}
            loading={loading}
            onClick={() => {this.saveApp();
            }}
          />
        </div>
        */}
        </div>
        <pre>{JSON.stringify(application, null, 2)}</pre>
      </div>
    )) || <div>Loading</div>
  );
};
