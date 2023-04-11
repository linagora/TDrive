/**
 *
 * This helper will make sure of two things:
 * - we call request as soon as possible
 * - then we wait options.timeout before calling any new request
 * - we can avoid the initial instant callback with options.doInitialCallback
 */

const delayedRequests: Map<string, () => Promise<void>> = new Map();
const delayedRequestsHasTimout: Map<string, boolean> = new Map();

const requestIsInProgress: { [key: string]: boolean } = {};

export const delayRequest = async (
  key: string,
  request: () => Promise<void>,
  options: { timeout: number; doInitialCall: boolean } = { timeout: 1000, doInitialCall: true },
) => {
  if (!delayedRequestsHasTimout.has(key)) {
    delayedRequestsHasTimout.set(key, true);

    if (options.doInitialCall) {
      requestIsInProgress[key] = true;
      try {
        await request();
      } catch (e) {
        requestIsInProgress[key] = false;
        throw e;
      }
      requestIsInProgress[key] = false;
    } else delayedRequests.set(key, request);

    setTimeout(() => {
      const request = delayedRequests.get(key);
      delayedRequestsHasTimout.delete(key);
      request &&
        delayRequest(key, request, { ...options, doInitialCall: !requestIsInProgress[key] });
      delayedRequests.delete(key);
    }, options.timeout);
  } else {
    delayedRequests.set(key, request);
  }
};
