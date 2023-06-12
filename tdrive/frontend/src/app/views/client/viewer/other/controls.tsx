/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@atoms/button/button';
import LockedOnlyOfficePopup from '@components/locked-features-components/locked-only-office-popup/locked-only-office-popup';
import ModalManager from '@components/modal/modal-manager';
import { useDrivePreview } from '@features/drive/hooks/use-drive-preview';
import FeatureTogglesService, {
  FeatureNames,
} from '@features/global/services/feature-toggles-service';
import Languages from '@features/global/services/languages-service';
import MenuManager from 'components/menus/menus-manager';
import { useEditors } from './editors-service';

export default () => {
  const { status } = useDrivePreview();
  const extension = status?.item?.name?.split('.').pop();
  const { candidates, openFile } = useEditors(extension || '');

  if (!['manage', 'write'].includes(status?.details?.access || '') || !status?.details) {
    return <></>;
  }

  return (
    <>
      {candidates.length === 1 && (
        <Button
          className="ml-4"
          theme="dark"
          onClick={() => {
            if (FeatureTogglesService.isActiveFeatureName(FeatureNames.EDIT_FILES)) {
              openFile(
                candidates[0].app,
                status.details?.versions?.[0]?.file_metadata?.external_id || '',
                status.details?.item.id || '',
              );
            } else {
              ModalManager.open(
                <LockedOnlyOfficePopup />,
                {
                  position: 'center',
                  size: { width: '600px' },
                },
                false,
              );
            }
          }}
        >
          {Languages.t('scenes.apps.drive.viewer.edit_with_button', [
            candidates[0].app?.identity.name,
          ])}
        </Button>
      )}
      {candidates.length > 1 && (
        <Button
          className="ml-4"
          theme="dark"
          onClick={e => {
            e.stopPropagation();
            MenuManager.openMenu(
              candidates.map((editor: { [key: string]: any }) => {
                return {
                  type: 'menu',
                  text: editor?.app?.identity?.name,
                  onClick: () => {
                    openFile(
                      editor.app,
                      status.details?.versions?.[0]?.file_metadata?.external_id || '',
                      status.details?.item.id || '',
                    );
                  },
                };
              }),
              (window as any).getBoundingClientRect(e.target),
              'top',
              { margin: 0 },
            );
          }}
        >
          {Languages.t('scenes.apps.drive.viewer.open_with_button')}
        </Button>
      )}
    </>
  );
};
