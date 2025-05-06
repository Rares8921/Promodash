import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './locales/en.json';
import ro from './locales/ro.json';

const translations = { en, ro };
const i18n = new I18n(translations);

// Preia limba telefonului
const deviceLanguage = Localization.locale.split('-')[0];

if (Object.keys(translations).includes(deviceLanguage)) {
  i18n.locale = deviceLanguage;
} else {
  i18n.locale = 'en';
}

i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export default i18n;
