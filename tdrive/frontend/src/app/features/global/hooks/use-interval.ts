import { useEffect, useLayoutEffect, useRef } from 'react';
import Logger from 'app/features/global/framework/logger-service';

const logger = Logger.getLogger('useInterval');

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (!delay) {
      return;
    }

    const id = setInterval(() => {
      logger.debug(`Running interval ${id}`);
      savedCallback.current();
    }, delay);
    logger.debug(`Created interval ${id} with delay ${delay}`);

    return () => {
      logger.debug(`Clearing interval ${id}`);
      clearInterval(id);
    };
  }, [delay]);
};

export default useInterval;
