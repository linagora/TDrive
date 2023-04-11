/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import Observable from 'app/deprecated/CollectionsV1/observable';
import DateTime from 'app/features/global/utils/datetime';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import Version from 'app/environment/version';
class LanguagesService extends Observable {
  private i18nt: Function | null = null;
  private language = '';
  private default = 'en';
  private available = [
    'de',
    'en',
    'eo',
    'es',
    'eu',
    'fi',
    'fr',
    'it',
    'ja',
    'nb_NO',
    'ru',
    'si',
    'tr',
    'vi',
    'zh_Hans',
  ];

  constructor() {
    super();
    this.setObservableName('i18n');
    (window as any).languageService = this;

    this.init();
  }

  async init() {
    this.i18nt = await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next) // passes i18n down to react-i18next
      .init({
        fallbackLng: this.default,
        supportedLngs: this.available,
        backend: { loadPath: '/locales/{{lng}}.json' + '?v=' + Version.version_detail },
        interpolation: {
          escapeValue: false, // react already safes from xss
        },
      });
  }

  async setLanguage(language: string) {
    if (!language) language = this.default;

    if (this.language === language) {
      return;
    }

    this.language = language;

    if (!language) {
      language = this.default;
    }

    await i18n.changeLanguage(language);
    DateTime.setCurrentLanguage(language);

    this.notify();
  }

  t(route: string, parameters: any[] = [], fallback?: string) {
    let replace: any = {};
    try {
      if (Array.isArray(parameters)) {
        (parameters || []).forEach((r, i) => {
          replace[`$${i + 1}`] = r;
        });
      } else if (typeof parameters === 'object') {
        replace = parameters;
      }
    } catch (e) {
      console.log(e);
    }
    if (this.i18nt) {
      return this.i18nt(route, fallback, { replace });
    }
    return '';
  }
}
const Languages = new LanguagesService();
export default Languages;
