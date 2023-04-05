import { useEffect, useState } from 'react';
import { Maybe } from 'app/features/global/types/global-types';
import Globals from '../services/globals-tdrive-app-service';
import JWTStorage from '../../auth/jwt-storage-service';
import Logger from '../framework/logger-service';

const logger = Logger.getLogger('useHTTP');

const useGetHTTP = <T>(path: string): [Maybe<T>, Maybe<Error>] => {
  const url = `${Globals.api_root_url}/internal/services/${path}`;
  const [response, setResponse] = useState<T>();
  const [error, setError] = useState<Error>();
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: JWTStorage.getAutorizationHeader(),
  };

  useEffect(() => {
    fetch(url, {
      method: 'GET',
      headers,
    })
      .then(response => {
        logger.debug(url, response.status);
        return response;
      })
      .then(response => response.json() as unknown as T)
      .then(r => setResponse(r))
      .catch(err => setError(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return [response, error];
};

export {
  useGetHTTP,
  // TODO: Other methods
};
