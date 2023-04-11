import React, { useEffect } from 'react';
import './connection-indicator.scss';
import ErrorOutlinedIcon from '@material-ui/icons/ErrorOutlined';
import HourglassEmpty from '@material-ui/icons/HourglassEmpty';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Languages from 'app/features/global/services/languages-service';
import { ConnectedState } from 'app/features/users/state/atoms/connected';
import { useRecoilState } from 'recoil';
import WebSocket, { WebsocketEvents } from 'app/features/global/types/websocket-types';

export default () => {
  const [{ connected, reconnecting }, setState] = useRecoilState(ConnectedState);

  useEffect(() => {
    WebSocket.get().on(WebsocketEvents.Disconnected, () => {
      setState({ connected: false, reconnecting: false });
    });
    WebSocket.get().on(WebsocketEvents.Connected, () => {
      setState({ connected: true, reconnecting: false });
    });
  }, [setState]);

  return (
    <div className={'connection_indicator ' + (connected === false ? 'visible' : '')}>
      {connected === false && reconnecting !== true && (
        <div>
          <ErrorOutlinedIcon /> <span>{Languages.t('general.connexion_status.disconnected')}</span>
        </div>
      )}
      {connected === false && reconnecting === true && (
        <div>
          <HourglassEmpty /> <span>{Languages.t('general.connexion_status.connecting')}</span>
        </div>
      )}
      {connected === true && (
        <div>
          <CheckCircleIcon /> <span>{Languages.t('general.connexion_status.connected')}</span>
        </div>
      )}
    </div>
  );
};
