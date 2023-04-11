import A from 'app/atoms/link';
import { Base, Info } from 'app/atoms/text';
import { useDriveItem, getPublicLink } from 'app/features/drive/hooks/use-drive-item';
import { ToasterService } from 'app/features/global/services/toaster-service';
import { copyToClipboard } from 'app/features/global/utils/CopyClipboard';
import { AccessLevel } from './common';

export const PublicLinkManager = ({ id, disabled }: { id: string; disabled?: boolean }) => {
  const { item, loading, update } = useDriveItem(id);
  const publicLink = getPublicLink(item);
  return (
    <>
      <Base className="block mt-2 mb-1">Public link access</Base>
      <div className="flex flex-row p-4 rounded-md border overflow-hidden">
        <div className="grow">
          {item?.access_info?.public?.level !== 'none' && (
            <Info>Anyone with this link will have access to this item.</Info>
          )}
          {item?.access_info?.public?.level === 'none' && (
            <Info>This item is not available by public link.</Info>
          )}
          {item?.access_info?.public?.level !== 'none' && (
            <>
              <br />
              <A
                className="inline-block"
                onClick={() => {
                  copyToClipboard(publicLink);
                  ToasterService.success('Public link copied to clipboard');
                }}
              >
                Copy public link to clip board
              </A>
            </>
          )}
        </div>
        <div className="shrink-0">
          <AccessLevel
            hiddenLevels={['manage', 'write']}
            disabled={loading || disabled}
            level={item?.access_info?.public?.level || null}
            onChange={level => {
              update({
                access_info: {
                  entities: item?.access_info.entities || [],
                  public: { ...(item?.access_info?.public || { token: '' }), level },
                },
              });
            }}
          />
        </div>
      </div>
    </>
  );
};
