import React, { useEffect, useState } from 'react';
import { Button, Input, Space, message } from 'antd';
import { DeleteOutlined, RetweetOutlined } from '@ant-design/icons';
import Languages from 'app/features/global/services/languages-service';
import RouterServices from 'app/features/router/services/router-service';
import './MagicLinks.scss';
import { MagicLinksGeneratorService } from 'app/features/workspaces/services/magic-links-service';

type PropsType = {
  loading?: boolean;
};

export default (props: PropsType): JSX.Element => {
  const { companyId, workspaceId } = RouterServices.getStateFromRoute();
  const [ready, setReady] = useState(false);
  const [currentToken, setCurrentToken] = useState<string>();
  const [link, setLink] = useState<string>();
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const busy = (val: boolean) => {
    setLoading(val);
    setDisabled(val);
  };

  const magicLinksService = new MagicLinksGeneratorService(companyId as string, workspaceId as string, busy);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    setLink(`${window.location.origin}/?join=${currentToken}`);
  }, [currentToken]);

  const init = () => {
    magicLinksService.getCurrentTokens().then(resources => {
      setCurrentToken(resources ? resources[0].token : undefined);
      setReady(true);
    });
  };

  const onGenerateBtnClick = () => {
    magicLinksService.recreateToken().then(resource => setCurrentToken(resource.token));
    message.success(Languages.t('scenes.app.popup.adduser.magiclinks.new_link_generated'));
  };

  const onDeleteBtnClick = () => {
    if (currentToken) {
      magicLinksService.deleteToken(currentToken).then(() => setCurrentToken(undefined));
    }
  };

  const onCopyBtnClick = () => {
    navigator.clipboard.writeText(link as string);
    message.success(Languages.t('scenes.app.popup.adduser.magiclinks.copied_to_clipboard'));
  };

  const onMouseOver = () => setShowButtons(true);
  const onMouseLeave = () => setShowButtons(false);

  const suffix = (
    <div className="link-input-suffix" style={showButtons ? {} : { display: 'none' }}>
      <DeleteOutlined onClick={onDeleteBtnClick} className="action-button" />
      <RetweetOutlined onClick={onGenerateBtnClick} className="action-button" />
    </div>
  );

  const TokenInput = () => (
    <Input.Search
      className="link-input"
      disabled={disabled}
      enterButton={Languages.t('scenes.app.popup.adduser.magiclinks.action_copy')}
      defaultValue={link}
      suffix={suffix}
      loading={loading}
      onSearch={onCopyBtnClick}
    />
  );

  const DeleteButton = () => (
    <Button
      type="primary"
      onClick={onGenerateBtnClick}
      disabled={disabled || props.loading}
      loading={loading || props.loading}
    >
      {Languages.t('scenes.app.popup.adduser.magiclinks.action_generate')}
    </Button>
  );

  return ready ? (
    <div className="magic-links">
      <Space direction="vertical" style={{ width: '100%' }}>
        {Languages.t('scenes.app.popup.adduser.magiclinks.genrator_info')}
        <div onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
          {currentToken ? <TokenInput /> : <DeleteButton />}
        </div>
      </Space>
    </div>
  ) : (
    <></>
  );
};
