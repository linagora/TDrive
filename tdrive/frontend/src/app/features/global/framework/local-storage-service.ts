export default class LocalStorage {
  static prefix = 'tdrive:';

  //For shared views we will use another prefix
  static setPrefix(prefix: string) {
    LocalStorage.prefix = prefix;
  }

  static setItem(key: string, value: unknown) {
    window.localStorage.setItem(`${LocalStorage.prefix}${key}`, JSON.stringify(value));
  }

  static getItem<T>(key: string): T | string | null {
    let value = window.localStorage.getItem(`${LocalStorage.prefix}${key}`);

    if (!value) {
      return null;
    }

    try {
      value = JSON.parse(value);
    } catch (e) {
      value = null;
      console.log(e);
    }

    return value as unknown as T;
  }

  static clear() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const depreciatedKeysRemove =
          [
            'tdrive-collections-db',
            'm_input',
            'language',
            'jwt',
            'autoload_workspaces',
            'oidc.',
          ].some(m => key.indexOf(m) === 0) || key.indexOf(':channel') > 0;
        if (key.indexOf(LocalStorage.prefix) === 0 || depreciatedKeysRemove)
          window.localStorage.removeItem(key);
      }
    }
  }
}
