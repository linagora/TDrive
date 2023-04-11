/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import EventListener from 'events';

/**
 * Observable service
 * Allow any service to be listened and component to be updated when this service notify.
 * As a service just extends this class and call this.notify() when update was made.
 * As a component just call ServiceName.useWatcher(()=>ServiceName.store.status) //Only changes to store.status will trigger a change.
 */

type Watcher = {
  callback: (transform: any) => void;
  observedScope: () => any;
  savedChanges: any;
  options?: {
    observedChanges: (changes: any) => any;
  } & any;
};

export const useWatcher = <G>(
  observable: Observable,
  observedScope: () => Promise<G> | G,
  options?: any,
): G => {
  const value: any = observedScope();
  const isAsync = ['Promise', 'AsyncFunction'].indexOf(value?.constructor?.name || '') < 0;

  const [, forceRender] = useState<G>(isAsync ? null : value);

  const savedObservable = useRef(observable);
  const savedForceRender = useRef((v: any) => forceRender(v));

  useMemo(() => {
    savedObservable.current.removeWatcher(forceRender);
    observable.addWatcher(forceRender, observedScope, options);
    savedObservable.current = observable;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options?.memoizedFilters || []);

  useEffect(() => {
    savedObservable.current.removeWatcher(savedForceRender.current);
    observable.addWatcher(savedForceRender.current, observedScope, options);
    savedObservable.current = observable;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observable]);

  useEffect(() => {
    const watcher = savedObservable.current.addWatcher(
      savedForceRender.current,
      observedScope,
      options,
    );

    savedObservable.current.getChanges<G>(watcher).then(changes => {
      if (changes.didChange) {
        forceRender(changes.changes);
      }
    });

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      savedObservable.current.removeWatcher(savedForceRender.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value as G;
};

export default class Observable extends EventListener {
  public watchers: Watcher[] = [];

  constructor() {
    super();
    this.addWatcher = this.addWatcher.bind(this);
    this.notify = this.notify.bind(this);
    this.removeWatcher = this.removeWatcher.bind(this);
    this.getChanges = this.getChanges.bind(this);
  }

  useWatcher<G>(observedScope: () => Promise<G> | G, options?: any): G {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useWatcher(this, observedScope, options);
  }

  notify() {
    this.watchers.forEach(async watcher => {
      const changes = await this.getChanges(watcher);
      if (changes.didChange) {
        //If things changed
        const value =
          typeof changes.changes === 'object' && changes.changes?.constructor?.name !== 'Array'
            ? Object.assign(Object.create(Object.getPrototypeOf(changes.changes)), changes.changes)
            : changes.changes;
        watcher.callback(value);
      }
    });
  }

  async getChanges<G>(watcher: Watcher): Promise<{ changes: G; didChange: boolean }> {
    const changes = await watcher.observedScope();

    let observed = changes;
    if (watcher.options?.observedChanges) {
      observed = watcher.options?.observedChanges(changes);
    }

    const cache: any[] = [];
    const snapshot = JSON.stringify(observed, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Duplicate reference found, discard key
        if (cache.includes(value)) return;

        // Store value in our collection
        cache.push(value);
      }
      return value;
    });

    if (watcher.savedChanges === snapshot) {
      return { changes: changes, didChange: false };
    }
    watcher.savedChanges = snapshot;

    return { changes: changes, didChange: true };
  }

  addWatcher(callback: (transform: any) => void, observedScope: () => any, options?: any): Watcher {
    const watcher = {
      callback: callback,
      observedScope: observedScope,
      savedChanges: null,
      options: options,
    };
    if (this.watchers.length === 0) {
      this.emit('watcher:exists');
    }
    this.watchers.push(watcher);
    return watcher;
  }

  removeWatcher(callback: (transform: any) => void) {
    const lengthBefore = this.watchers.length;
    this.watchers = this.watchers.filter(i => i.callback !== callback);
    if (lengthBefore > 0 && this.watchers.length === 0) {
      this.emit('watcher:none');
    }
  }
}
