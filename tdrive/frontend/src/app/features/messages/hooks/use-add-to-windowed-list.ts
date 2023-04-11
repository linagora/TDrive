/* eslint-disable @typescript-eslint/no-explicit-any */
import Numbers from 'app/features/global/utils/Numbers';
import _ from 'lodash';
import { RecoilState, useRecoilCallback } from 'recoil';

/**
 * This is the hook to work with feed window (from where to where we are looking the messages)
 * useful mostly in case of jumps
 */
export type WindowType = {
  loaded: boolean;
  start: string;
  end: string;
  reachedStart: boolean;
  reachedEnd: boolean;
};
const windows: Map<string, WindowType> = new Map();
(window as any).windows = windows;
export const getListWindow = (key: string) => {
  if (!windows.has(key))
    windows.set(key, { loaded: false, start: '', end: '', reachedEnd: false, reachedStart: false });
  let window = windows.get(key) as WindowType;

  const updateWindowFromIds = (ids: string[]) => {
    let window = windows.get(key) as WindowType;
    const min = ids.reduce((a, b) => Numbers.minTimeuuid(a, b), ids[0]);
    const max = ids.reduce((a, b) => Numbers.maxTimeuuid(a, b), ids[0]);
    if (max !== window.end || min !== window.start) {
      windows.set(key, {
        ...window,
        start: min,
        end: max,
      });
    }
    window = windows.get(key) as WindowType;
    return window;
  };

  const reachEdge = (status: { reachedStart?: boolean; reachedEnd?: boolean }) => {
    status = _.pick(status, 'reachedEnd', 'reachedStart');
    windows.set(key, {
      ...window,
      ...status,
    });
    window = windows.get(key) as WindowType;
    return window;
  };

  const isInWindow = (id: string) => {
    const window = windows.get(key) as WindowType;
    return (
      (Numbers.compareTimeuuid(id, window.start) >= 0 || !window.start) &&
      (Numbers.compareTimeuuid(id, window.end) <= 0 || !window.end)
    );
  };

  const setLoaded = (loaded = true) => {
    const window = windows.get(key) as WindowType;
    windows.set(key, {
      ...window,
      loaded,
    });
  };

  return {
    window,
    updateWindowFromIds,
    reachEdge,
    isInWindow,
    setLoaded,
    setWindow: (window: WindowType) => windows.set(key, window),
    getWindow: () => windows.get(key) as WindowType,
  };
};

export type AddToWindowOptions = {
  atBottom?: boolean; //Messages are new and should be added at the end of the full list
  reachedEnd?: boolean; //We know that we reached the end while adding this messages
  reachedStart?: boolean; //We know that we reached the start while adding this messages
  inWindow?: boolean; //We know that this new messages are in or glued to the current window
};

export type AddToWindowedListOptions<T> = {
  windowKey: string; //The key of the window managing this list
  atom: RecoilState<T[]>; //The atom containing the list
  getId?: (item: T) => string; //A method to get the id
} & AddToWindowOptions;

export type RemoveFromWindowedListOptions<T> = {
  atom: RecoilState<T[]>; //The atom containing the list
  getId?: (item: T) => string; //A method to get the id
};

export const useAddToWindowedList = (companyId: string) => {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      async <T>(items: T[], options: AddToWindowedListOptions<T>) => {
        const getId = options.getId || ((m: any) => m?.id);

        //Update the current window
        const {
          window: _window,
          updateWindowFromIds,
          reachEdge,
        } = getListWindow(options.windowKey);
        let window = _window;
        if (options.reachedEnd || (options.atBottom && !window.end))
          options = { ...options, reachedEnd: true };
        if (options.reachedEnd || options.reachedStart) window = reachEdge(options);
        if (((options.atBottom && window.reachedEnd) || options.inWindow) && items?.length > 0)
          updateWindowFromIds([window.start, window.end, ...items.map(m => getId(m))]);

        if (items?.length === 0) return;

        const atom = options.atom;
        const newList = _.uniqBy(
          [...(snapshot.getLoadable(atom).valueMaybe() || []), ...(items || [])],
          m => getId(m),
        );

        set(atom, newList);
      },
    [companyId],
  );
};

export const useRemoveFromWindowedList = (companyId: string) => {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      async <T>(items: T[], options: RemoveFromWindowedListOptions<T>) => {
        if (items.length === 0) return;

        const getId = options.getId || ((m: any) => m?.id);

        const toRemove = items.map(m => getId(m));

        const atom = options.atom;

        const newList = (snapshot.getLoadable(atom).valueMaybe() || []).filter(
          m => !toRemove.includes(getId(m)),
        );

        set(atom, newList);
      },
    [companyId],
  );
};
