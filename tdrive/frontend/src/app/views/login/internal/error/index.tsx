import React from 'react';
import Languages from 'app/features/global/services/languages-service';
import Emojione from 'components/emojione/emojione';
import './styles.scss';
import { Button } from 'antd';
import LoginService from 'app/features/auth/login-service';

export default () => {
  return (
    <div className="full_page_error_login">
      <div className="error_message skew_in_top_nobounce">
        <div className="title">
          <Emojione type="❌" size={32} />{' '}
          {Languages.t('scenes.login_error', [], 'There was an error while logging you into Tdrive')}
        </div>
        <div className="subtitle">{LoginService.parsed_error_code}</div>

        {LoginService.error_code}

        <br />
        <br />
        <br />

        <Button
          type="primary"
          onClick={() => {
            document.location.replace('/login?auto=1');
          }}
        >
          {Languages.t('scenes.login_error_retry', [], 'Try again')}
        </Button>
      </div>
    </div>
  );
};
