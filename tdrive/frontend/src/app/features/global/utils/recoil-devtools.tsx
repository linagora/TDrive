import React, { useState } from 'react';
import { useEffect } from 'react';
import { Snapshot, useGotoRecoilSnapshot, useRecoilCallback, useRecoilSnapshot } from 'recoil';

export const DebugObserver = () => {
  const snapshot = useRecoilSnapshot();

  useEffect(() => {
    console.debug('The following atoms have been modified');

    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug(node.key, snapshot.getLoadable(node));
    }
  }, [snapshot]);

  return null;
};

export const DebugButton = () => {
  const onClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        console.debug('Atom values');
        for (const node of snapshot.getNodes_UNSTABLE()) {
          const value = await snapshot.getPromise(node);
          console.debug(node.key, value);
        }
      },
    [],
  );

  return <button onClick={onClick}>Dump State</button>;
};

export const TimeTravelObserver = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const snapshot = useRecoilSnapshot();
  useEffect(() => {
    if (snapshots.every(s => s.getID() !== snapshot.getID())) {
      setSnapshots([...snapshots, snapshot]);
    }
  }, [snapshot, snapshots]);

  const gotoSnapshot = useGotoRecoilSnapshot();

  return (
    <ol>
      {snapshots.map((snapshot, i) => (
        <li key={i}>
          Snapshot {i}
          <button onClick={() => gotoSnapshot(snapshot)}>Restore</button>
        </li>
      ))}
    </ol>
  );
};
