/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useRecoilCallback } from 'recoil';

interface TdriveDebugState {
  dumpStateSnapshot?(): void;
  get?(key: string): void;
  getAllAtoms?(): void;
}

const tdriveDebugState: TdriveDebugState = {};

const useDebugRecoilState = () => {
  /**
   * Get the value of an atom by key
   *
   * @param {string} key - The key of the atom
   * @returns {void}
   */
  tdriveDebugState.get = useRecoilCallback(
    ({ snapshot }) =>
      async (key: string) => {
        const allNodes = Array.from(snapshot.getNodes_UNSTABLE());
        const node = allNodes.find(node => node.key === key);

        if (node) {
          console.debug(key, await snapshot.getPromise(node));
        }
      },
    [],
  );

  /**
   * Dump the current state of the application to a json file
   *
   * @returns {void}
   */
  tdriveDebugState.dumpStateSnapshot = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const result: Record<string, any> = {
          localStorage: {},
        };

        for (const node of snapshot.getNodes_UNSTABLE()) {
          const value = await snapshot.getPromise(node);

          result[node.key] = value;
        }

        for (const key of Object.keys(window.localStorage)) {
          result.localStorage[key] = window.localStorage.getItem(key);
        }

        const json = JSON.stringify(result, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `tdrive-state-${new Date().toISOString()}.json`;

        link.click();
        URL.revokeObjectURL(url);
      },
    [],
  );

  /**
   * lists the value of all atoms
   *
   * @returns {void}
   */
  tdriveDebugState.getAllAtoms = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        for (const node of snapshot.getNodes_UNSTABLE()) {
          const value = await snapshot.getPromise(node);

          console.debug(node.key, value);
        }
      },
    [],
  );

  (window as any).tdriveDebugState = tdriveDebugState;
};


export default (): React.ReactElement => {
  useDebugRecoilState();

  return <></>;
};
