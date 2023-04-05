import environment from 'app/environment/environment';
import Globals from 'app/features/global/services/globals-tdrive-app-service';

export function addApiUrlIfNeeded(url: string, asCssUrl?: boolean): string {
  function _wrap(url: string): string {
    return asCssUrl ? `url('${url}')` : url;
  }

  if (!url) {
    return _wrap(url);
  }

  if (/^http/.test(url)) {
    return _wrap(url);
  }

  return _wrap(`${Globals.api_root_url}/${url.replace(/^\//, '').replace(/\/+/g, '/')}`);
}

export function getAsFrontUrl(path: string): string {
  return `${environment.front_root_url || ''}${path}`;
}
