import { detect } from 'detect-browser';
import { BrowserInformation } from './types';

/**
 * Detects the current browser and operating system.
 *
 * @returns {BrowserInformation | null} the browser information or null if it could not be detected
 */
export const getBrowserInformation = (): BrowserInformation | null => {
  const browser = detect();

  if (!browser) return null;

  return {
    name: browser.name,
    version: browser.version,
    os: browser.os,
  };
};
