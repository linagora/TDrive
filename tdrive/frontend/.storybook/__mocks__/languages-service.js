import en from '../../public/locales/en.json';

export default {
  t: term => en[term] || term,
}

export function decorator(story) {
  return story();
}
