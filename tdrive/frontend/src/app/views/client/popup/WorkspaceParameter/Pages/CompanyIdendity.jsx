import { Component } from 'react';

import { getFilesTree } from 'app/components/uploads/file-tree-utils';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections';
import groupService from 'app/deprecated/workspaces/groups';
import Languages from 'app/features/global/services/languages-service';
import { addApiUrlIfNeeded } from 'app/features/global/utils/URLUtils';
import ButtonWithTimeout from 'components/buttons/button-with-timeout';
import Input from 'components/inputs/input';
import Attribute from 'components/parameters/attribute';

import './Pages.scss';

export default class CompanyIdendity extends Component {
  constructor() {
    super();
    var group = Collections.get('groups').find(groupService.currentGroupId);
    this.state = {
      i18n: Languages,
      group: Collections.get('groups'),
      groupService: groupService,
      groupName: group.name ? group.name : '',
      groupLogo: group.logo ? group.logo : '',
    };
    groupService.addListener(this);
    Languages.addListener(this);
  }
  componentWillUnmount() {
    groupService.removeListener(this);
    Languages.removeListener(this);
  }
  changeLogo(event) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var that = this;
    event.preventDefault();
    getFilesTree(event, function (tree) {
      var first = tree[Object.keys(tree)[0]];
      if (first.constructor.name !== 'Object') {
        //A file
        var reader = new FileReader();
        reader.onload = function (e) {
          that.groupLogo.style.backgroundImage = "url('" + e.target.result + "')";
        };
        that.setState({ groupLogo: first });
        reader.readAsDataURL(first);
      }
    });
  }
  render() {
    var group = Collections.get('groups').find(groupService.currentGroupId);
    return (
      <div className="">
        <div className="title">
          {Languages.t(
            'scenes.app.popup.workspaceparameter.pages.company_identity_title',
            [],
            "Identité de l'entreprise",
          )}
        </div>

        <div className="group_section">
          <div className="subtitle">
            {Languages.t(
              'scenes.app.popup.workspaceparameter.pages.displayed_preferencies_subtitle',
              [],
              "Préférences d'affichage",
            )}
          </div>

          <Attribute
            label={Languages.t(
              'scenes.app.popup.workspaceparameter.pages.company_name_label',
              [],
              "Nom de l'entreprise",
            )}
            description={Languages.t(
              'scenes.app.popup.workspaceparameter.pages.company_name_description',
              [],
              'Modifiez le nom de cette entreprise',
            )}
            focusOnOpen={this.inputWorkspaceName}
          >
            <div className="parameters_form">
              <Input
                medium
                refInput={node => (this.inputWorkspaceName = node)}
                type="text"
                value={this.state.groupName}
                onKeyDown={e => {
                  if (e.keyCode === 13) {
                    groupService.updateName(this.state.groupName);
                  }
                }}
                onChange={ev => this.setState({ groupName: ev.target.value })}
              />
              <ButtonWithTimeout
                className="small buttonValidation"
                disabled={this.state.groupService.loading}
                onClick={() => this.state.groupService.updateName(this.state.groupName)}
                loading={this.state.groupService.loading}
                value={this.state.i18n.t('general.update')}
              />
            </div>
          </Attribute>
          <Attribute
            label={Languages.t(
              'scenes.apps.parameters.workspace_sections.workspace.logo_company',
              [],
              "Logo de l'entreprise",
            )}
            description={Languages.t(
              'scenes.app.popup.workspaceparameter.pages.logo_company_modify_description',
              [],
              "Modifiez l'image de cet entreprise",
            )}
          >
            <div
              onClick={() => {
                this.fileinput.click();
              }}
            >
              <input
                ref={node => (this.fileinput = node)}
                type="file"
                style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '100px' }}
                onChange={e => this.changeLogo(e)}
              />
              <div
                ref={ref => (this.groupLogo = ref)}
                className={'image thumbnail ' + (this.state.groupLogo ? 'has_image ' : '')}
                style={{
                  backgroundImage: addApiUrlIfNeeded(this.state.groupLogo, true),
                }}
              >
                {((group.mininame || group.name) + '-')[0].toUpperCase()}
              </div>
            </div>
            <div className="smalltext">
              {Languages.t(
                'scenes.app.popup.workspaceparameter.pages.weight_max_small_text',
                [],
                'Maximum weight 5 mo.',
              )}
              <br />
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                className="red"
                onClick={() => {
                  this.setState({ groupLogo: null });
                }}
              >
                {Languages.t('general.remove')}
              </a>
            </div>
            <div>
              <ButtonWithTimeout
                className="small buttonValidation"
                disabled={this.state.groupService.loading}
                onClick={() => this.state.groupService.updateLogo(this.state.groupLogo)}
                loading={this.state.groupService.loading}
                value={this.state.i18n.t('general.update')}
              />
            </div>
          </Attribute>
        </div>
      </div>
    );
  }
}
