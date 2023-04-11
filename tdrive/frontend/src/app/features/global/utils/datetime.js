import moment from 'moment';
import 'moment/locale/ru';
import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/ja';
import 'moment/locale/es';
import Observable from 'app/deprecated/CollectionsV1/observable.js';
import UserService from 'app/features/users/services/current-user-service';

import Globals from 'app/features/global/services/globals-tdrive-app-service';

class DateTime extends Observable {
  constructor() {
    super();

    if (!Globals.window.navigator) {
      Globals.window.navigator = {};
    }

    this.observableName = 'dateTimeService';
    this.locale = this.cleanLocal(
      Globals.window.navigator.userLanguage || Globals.window.navigator.language || 'en',
    );
  }
  getCurrentLanguage() {
    return this.locale;
  }
  setCurrentLanguage(lang) {
    this.locale = this.cleanLocal(lang);
    moment.locale(this.locale);
    this.notify();
  }
  cleanLocal(string) {
    if (string.split('-').length > 1) {
      return string.split('-')[0];
    }
    return string;
  }

  getDefaultTimeFormat() {
    var h24list = [
      'af',
      'ar-dz',
      'ar-kw',
      'ar-ly',
      'ar-ma',
      'ar-sa',
      'ar-tn',
      'ar',
      'az',
      'be',
      'bg',
      'bn',
      'bo',
      'br',
      'bs',
      'ca',
      'cs',
      'cv',
      'cy',
      'da',
      'de-at',
      'de-ch',
      'de',
      'dv',
      'el',
      'en-au',
      'en-ca',
      'en-gb',
      'en-ie',
      'en-nz',
      'eo',
      'es-do',
      'es',
      'et',
      'eu',
      'fa',
      'fi',
      'fo',
      'fr-ca',
      'fr-ch',
      'fr',
      'fy',
      'gd',
      'gl',
      'gom-latn',
      'he',
      'hi',
      'hr',
      'hu',
      'hy-am',
      'id',
      'is',
      'it',
      'ja',
      'jv',
      'ka',
      'kk',
      'km',
      'kn',
      'ko',
      'ky',
      'lb',
      'lo',
      'lt',
      'lv',
      'me',
      'mi',
      'mk',
      'ml',
      'mr',
      'ms-my',
      'ms',
      'my',
      'nb',
      'ne',
      'nl-be',
      'nl',
      'nn',
      'pa-in',
      'pl',
      'pt-br',
      'pt',
      'ro',
      'ru',
      'sd',
      'se',
      'si',
      'sk',
      'sl',
      'sq',
      'sr-cyrl',
      'sr',
      'ss',
      'sv',
      'sw',
      'ta',
      'te',
      'tet',
      'th',
      'tl-ph',
      'tlh',
      'tr',
      'tzl',
      'tzm-latn',
      'tzm',
      'uk',
      'ur',
      'uz-latn',
      'uz',
      'vi',
      'x-pseudo',
      'yo',
      'zh-cn',
      'zh-hk',
      'zh-tw',
    ];
    if (
      h24list.indexOf(
        (UserService.getCurrentUser() || {}).language ||
          Globals.window.navigator.language ||
          Globals.window.navigator.userLanguage ||
          'en',
      ) >= 0
    ) {
      return 'H:mm';
    }
    return 'LT';
  }
  isDateFirstInFormat() {
    var numbers = moment().format('L').split('/');
    if (numbers[0] === new Date().getDate()) {
      return true;
    } else {
      return false;
    }
  }
  getDefaultDateFormat() {
    /*var numbers = moment().format("L").split("/");
      if(numbers[0] == (new Date()).getDate()){
        return "DD/MM/YYYY";
      }else{
        return "MM/DD/YYYY";
      }*/
    return 'LL'; //Default format for country better but US is "May 11, 2019" instead of "11 may 2019"
  }
}

var x = new DateTime();
Globals.window.dateTimeService = x;
export default x;
