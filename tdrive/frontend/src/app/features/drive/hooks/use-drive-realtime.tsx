import { useRealtimeRoom } from 'app/features/global/hooks/use-realtime';
import { useDriveActions } from './use-drive-actions';
import { useDriveItem } from './use-drive-item';

export const useDriveRealtime = (id: string) => {
  const { refresh } = useDriveActions();
  const { websockets } = useDriveItem(id);
  const room = websockets?.[0];
  useRealtimeRoom(room as { room: string; token: string }, 'useDriveRealtime-' + id, () => {
    refresh(id);
  });
};

export const DriveRealtimeObject = ({ id }: { id: string }) => {
  useDriveRealtime(id);
  return <></>;
};
