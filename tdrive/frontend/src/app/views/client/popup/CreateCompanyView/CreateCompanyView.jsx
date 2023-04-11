/* eslint-disable react/jsx-key */
/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import WorkspaceService from 'app/deprecated/workspaces/workspaces.jsx';
import LoginService from 'app/features/auth/login-service';
import popupManager from 'app/deprecated/popupManager/popupManager.js';
import Emojione from 'components/emojione/emojione';
import StepCounter from 'components/step-counter/step-counter.jsx';
import ButtonWithTimeout from 'components/buttons/button-with-timeout.jsx';
import './CreateCompanyView.scss';
import Input from 'components/inputs/input.jsx';
import CurrentUser from 'app/deprecated/user/CurrentUser';
import InitService from 'app/features/global/services/init-service';
import AddUserByEmail from 'app/views/client/popup/AddUser/AddUserByEmail';

export default class CreateCompanyView extends Component {
  constructor() {
    super();

    this.state = {
      login: LoginService,
      i18n: Languages,
      workspaces: WorkspaceService,
      companyName: '',
      groupType: '',
      groupSize: '',
      groupActivity: '',
      page: 1,
      members: [],
      collaborators: 0,
      input_to_show: 2,
      willClose: false,
    };

    LoginService.addListener(this);
    Languages.addListener(this);
    WorkspaceService.addListener(this);
  }
  componentDidMount() {
    this.did_create_workspace = false;
    if (this.input) {
      this.input.focus();
    }
  }
  componentWillUnmount() {
    LoginService.removeListener(this);
    Languages.removeListener(this);
    WorkspaceService.removeListener(this);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {}
  displayStep() {
    if (this.state.page === 1) {
      return (
        <div className="">
          <div className="subtitle bottom-margin">
            {this.state.i18n.t('scenes.app.workspaces.create_company.company_name.title_1')}
            <br />
            {this.state.i18n.t('scenes.app.workspaces.create_company.company_name.title_2')}{' '}
            <Emojione type=":writing_hand:" />
          </div>

          <Input
            refInput={ref => {
              this.input = ref;
            }}
            className="full_width big"
            type="text"
            onKeyDown={e => {
              if (e.keyCode === 13 && this.state.companyName.length > 0) {
                this.next();
              }
            }}
            placeholder={this.state.i18n.t(
              'scenes.app.workspaces.create_company.company_name.placeholder',
            )}
            value={this.state.companyName}
            onChange={evt => this.setState({ companyName: evt.target.value })}
          />
          <div className="bottom">
            <div className="returnBtn">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="blue_link" onClick={() => this.previous()}>
                {this.state.i18n.t('general.back')}
              </a>
            </div>
            <ButtonWithTimeout
              className="medium"
              disabled={this.state.companyName.length <= 0}
              onClick={() => this.next()}
              value={this.state.i18n.t('general.continue')}
            />
          </div>
        </div>
      );
    }
    if (this.state.page === 2) {
      return (
        <div className="">
          <div className="subtitle bottom-margin">
            {this.state.i18n.t('scenes.app.workspaces.create_company.group_data.title')}{' '}
            <Emojione type=":nerd:" />
          </div>
          <select
            className="select full_width medium bottom-margin"
            onChange={e => this.setState({ groupType: e.target.value })}
            value={this.state.groupType}
          >
            <option value={''} disabled selected>
              {this.state.i18n.t('scenes.app.workspaces.create_company.group_data.group_type')}
            </option>
            <option value={'company'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_type.company',
              )}
            </option>
            <option value={'public_organization'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_type.public_organization',
              )}
            </option>
            <option value={'university_school'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_type.university_school',
              )}
            </option>
            <option value={'society_club_charity'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_type.society_club_charity',
              )}
            </option>
            <option value={'other_group'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_type.other_group',
              )}
            </option>
          </select>
          <select
            className="select full_width medium bottom-margin"
            onChange={e => this.setState({ groupSize: e.target.value })}
            value={this.state.groupSize}
          >
            <option value={''} disabled selected>
              {this.state.i18n.t('scenes.app.workspaces.create_company.group_data.group_size')}
            </option>
            <option value={'less_3'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_size.less_3',
              )}
            </option>
            <option value={'4_10'}>
              {this.state.i18n.t('scenes.app.workspaces.create_company.group_data.group_size.4_10')}
            </option>
            <option value={'10_50'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_size.10_50',
              )}
            </option>
            <option value={'50_100'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_size.50_100',
              )}
            </option>
            <option value={'100_500'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_size.100_500',
              )}
            </option>
            <option value={'500_1000'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_size.500_1000',
              )}
            </option>
            <option value={'1000_5000'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_size.1000_5000',
              )}
            </option>
            <option value={'5000_more'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_size.5000_more',
              )}
            </option>
          </select>
          <select
            className="select full_width medium"
            onChange={e => this.setState({ groupActivity: e.target.value })}
            value={this.state.groupActivity}
          >
            <option value={''} disabled selected>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity',
              )}
            </option>
            <option value={'food'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.food',
              )}
            </option>
            <option value={'bank'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.bank',
              )}
            </option>
            <option value={'printing_paper'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.printing_paper',
              )}
            </option>
            <option value={'construction_building'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.construction_building',
              )}
            </option>
            <option value={'real_estate'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.real_estate',
              )}
            </option>
            <option value={'materials'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.materials',
              )}
            </option>
            <option value={'chemistry'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.chemistry',
              )}
            </option>
            <option value={'trade_commerce_distribution'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.trade_commerce_distribution',
              )}
            </option>
            <option value={'publishing_communication_multimedia'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.publishing_communication_multimedia',
              )}
            </option>
            <option value={'electronics_electricity_energy'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.electronics_electricity_energy',
              )}
            </option>
            <option value={'studies_and_advice'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.studies_and_advice',
              )}
            </option>
            <option value={'pharmaceutical_industry'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.pharmaceutical_industry',
              )}
            </option>
            <option value={'it_telecom'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.it_telecom',
              )}
            </option>
            <option value={'machinery_automotive'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.machinery_automotive',
              )}
            </option>
            <option value={'business_services'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.business_services',
              )}
            </option>
            <option value={'entertainment'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.entertainment',
              )}
            </option>
            <option value={'textile_clothing_shoes'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.textile_clothing_shoes',
              )}
            </option>
            <option value={'transport_logistics'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.transport_logistics',
              )}
            </option>
            <option value={'research'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.research',
              )}
            </option>
            <option value={'education'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.education',
              )}
            </option>
            <option value={'administration'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.administration',
              )}
            </option>
            <option value={'other'}>
              {this.state.i18n.t(
                'scenes.app.workspaces.create_company.group_data.group_main_activity.other',
              )}
            </option>
          </select>
          <div className="bottom">
            <div className="returnBtn">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="blue_link" onClick={() => this.previous()}>
                {this.state.i18n.t('general.back')}
              </a>
            </div>
            <ButtonWithTimeout
              className="medium"
              disabled={
                this.state.groupType === '' ||
                this.state.groupSize === '' ||
                this.state.groupActivity === ''
              }
              onClick={() => this.next()}
              value={this.state.i18n.t('general.continue')}
            />
          </div>
        </div>
      );
    }
    if (this.state.page === 3) {
      return (
        <AddUserByEmail
          inline
          onChange={members => {
            this.state.members = members;
            this.setState({ members: members });
          }}
          previous={() => this.previous()}
          finish={() => this.next()}
          loading={this.state.workspaces.loading}
        />
      );
    }
    if (this.state.page === 4) {
      return (
        <div
          className="importTools"
          onKeyDown={e => {
            console.log(e);
          }}
        >
          <div className="subtitle bottom-margin">
            {this.state.i18n.t('scenes.app.workspaces.create_company.importations.title_1')}{' '}
            <Emojione type=":tools:" />
            <br />
            {this.state.i18n.t('scenes.app.workspaces.create_company.importations.title_2')}
          </div>
          <div className="integrations">
            {[0, 0, 0, 0, 0, 0, 0, 0, 0].map(item => {
              return (
                <div className="integration">
                  <div className="logo">
                    <img alt="Calendar" src="/public/img/gcalendar.png" />
                  </div>
                  <div className="text">
                    <div className="name">Google Calendar</div>
                    <div className="description">
                      {Languages.t(
                        'scenes.app.popup.sync_calendar',
                        [],
                        'Synchronize your calendars.',
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bottom">
            <div className="returnBtn">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="blue_link" onClick={() => this.previous()}>
                {this.state.i18n.t('general.back')}
              </a>
            </div>
            <ButtonWithTimeout
              onClick={() => this.next()}
              value={this.state.i18n.t('general.continue')}
            />
          </div>
        </div>
      );
    }
  }
  previous() {
    if (this.state.page <= 1) {
      if (Object.keys(WorkspaceService.user_workspaces).length > 0) {
        popupManager.close();
      }
    } else {
      if (
        (['openid', 'cas'].indexOf((CurrentUser.get() || {}).identity_provider) >= 0 ||
          InitService.server_infos?.configuration?.accounts?.internal
            ?.disable_email_verification) &&
        this.state.page == 3
      ) {
        this.state.page = 2;
      }
      this.setState({ page: this.state.page - 1 });
    }
  }
  next() {
    if (this.state.page >= 3) {
      if (!this.did_create_workspace) {
        this.did_create_workspace = true;
        this.state.workspaces.createWorkspace(
          this.state.i18n.t('scenes.app.workspaces.create_company.default_workspace_name'),
          this.state.members || [],
          null,
          this.state.companyName,
          {
            type: this.state.groupType || '',
            size: this.state.groupSize || '',
            main_activity: this.state.groupActivity || '',
          },
        );
      }
    } else {
      //Pass usage form
      if (
        (['openid', 'cas'].indexOf((CurrentUser.get() || {}).identity_provider) >= 0 ||
          InitService.server_infos?.configuration?.accounts?.internal
            ?.disable_email_verification) &&
        this.state.page == 1
      ) {
        this.state.page = 2;
      }

      this.setState({ page: this.state.page + 1 });
    }
  }
  close() {
    this.setState({ willClose: true });
    setTimeout(() => {
      WorkspaceService.closeCreateCompanyPage();
    }, 200);
  }
  render() {
    return (
      <div className={'createCompanyView'}>
        <div
          className={
            'center_box_container login_view ' + (this.state.willClose ? 'fade_out ' : 'fade_in ')
          }
        >
          <div className="center_box ">
            <StepCounter total={3} current={this.state.page} />
            <div className="title">
              {this.state.i18n.t('scenes.app.workspaces.create_company.title')} {this.state.page}/3
            </div>
            {this.displayStep()}
          </div>
        </div>
      </div>
    );
  }
}
