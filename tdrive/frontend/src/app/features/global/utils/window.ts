/* eslint-disable @typescript-eslint/no-explicit-any */
import { capitalize } from 'lodash';
import Globals from 'app/features/global/services/globals-tdrive-app-service';

class WindowState {
  public readonly app_name: string = 'Tdrive';
  public prefix = '';
  public suffix = '';

  public allGetParameter() {
    const result: { [key: string]: string } = {};
    let tmp: string[] = [];
    Globals.window.location.search
      .substr(1)
      .split('&')
      .forEach(item => {
        tmp = item.split('=');
        result[tmp[0]] = tmp[1];
      });
    return result;
  }

  public findGetParameter(parameterName: string) {
    let result = null;
    let tmp = [];
    Globals.window.location.search
      .substr(1)
      .split('&')
      .forEach(function (item) {
        tmp = item.split('=');
        if (tmp[0] === parameterName) {
          result = decodeURIComponent(tmp[1]);
          if (tmp[1] === undefined) {
            result = true;
          }
        }
      });
    return result;
  }

  public updateTitle(): string {
    return (document.title = `${this.prefix}${this.app_name}${this.suffix}`);
  }

  public setSuffix(text?: string) {
    const separator = '-';
    this.suffix = text ? ` ${separator} ${capitalize(text)}` : '';

    return this.updateTitle();
  }

  public setPrefix(notifications_count = 0) {
    this.prefix = notifications_count > 0 ? `(${notifications_count}) ` : '';

    return this.updateTitle();
  }

  public nameToUrl(str: string) {
    return str
      .trim()
      .replace(/[ -/]+/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^@a-zA-Z0-9_]/g, '');
  }

  public reduceUUID4(id: string) {
    if (!id) return undefined;

    return id
      .replace(/(.)\1{2,3}/g, '$1i')
      .replace(/(.)\1{1,2}/g, '$1h')
      .replace(/-/g, 'g');
  }

  public expandUUID4(id: string) {
    if (!id) return undefined;

    return (
      id
        .replace(/(.)i/g, '$1$1$1')
        .replace(/(.)h/g, '$1$1')
        .replace(/[^0-9a-g]/g, '')
        .replace(/g/g, '-') || undefined
    );
  }

  public getInfoFromUrl() {
    let result: { [key: string]: any } = {};
    let url: string = document.location.pathname.replace(/^\/client/, '');

    if (url) {
      if (url.indexOf('/private/') === 0) {
        url = url.split('/').pop() || '';

        const list = url.split('-');

        result.channel_id = this.expandUUID4(list[1]);
        result.message = list[2] ? this.expandUUID4(list[2]) : false;

        if (!result.channel_id) result = {};
      } else {
        url = url.split('/').pop() || '';
        const list = url.split('-');
        const channel_id = list[2];
        const workspace_id = list[1];

        result.message = list[3] ? this.expandUUID4(list[3]) : false;
        result.channel_id = this.expandUUID4(channel_id);
        result.workspace_id = this.expandUUID4(workspace_id);

        if (!result.workspace_id || !result.channel_id) result = {};
      }
    }
    return result;
  }

  public reset() {
    this.setPrefix();
    this.setSuffix();
  }
}

export default new WindowState();
