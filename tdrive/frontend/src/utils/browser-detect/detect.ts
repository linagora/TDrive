import customProtocolCheck from 'custom-protocol-check';

/**
 * checks if the tdrive app is installed in the system using the browser
 *
 * @returns {boolean} true if the tdrive app is installed
 */
export const detect = async (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    customProtocolCheck(
      path,
      () => resolve(false),
      () => resolve(true),
      undefined,
      () => resolve(false),
    );
  });
};
