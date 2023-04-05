import Electron from 'app/features/global/framework/electron-service';
import { getDevice } from 'app/features/global/utils/device';
import { getBrowserInformation } from './common';
import { detect } from './detect';

/**
 * Checks if the tdrive desktop app is installed in the system.
 *
 * @returns {Promise<boolean>} true if the tdrive app is installed
 */
export async function detectDesktopAppPresence(
  path?: string,
  options?: { returnFalseIfOnDesktopApp: false },
): Promise<boolean> {
  const targetBrowser = getBrowserInformation();

  //If we are already on the desktop app
  if (Electron.isElectron()) {
    return options?.returnFalseIfOnDesktopApp ? false : true;
  }

  //Do not run this on mobile
  if (['ios', 'android'].includes(getDevice())) {
    return false;
  }

  // Chrome on linux is not supported
  if (targetBrowser?.name === 'chrome' && targetBrowser?.os === 'Linux') {
    console.debug('Desktop app detection: Chrome on Linux is not supported');
    return false;
  }

  console.debug(
    `Desktop app detection: target browser: ${targetBrowser?.name} on ${targetBrowser?.os}`,
  );

  return await detect(path || 'tdrive://check');
}
