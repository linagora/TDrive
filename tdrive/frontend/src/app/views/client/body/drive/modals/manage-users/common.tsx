import Select from '@atoms/input/input-select';
import { DriveFileAccessLevel } from '@features/drive/types';
import Languages from 'features/global/services/languages-service';

export const AccessLevel = ({
  disabled,
  level,
  onChange,
  canRemove,
  hiddenLevels,
  className,
}: {
  disabled?: boolean;
  level: DriveFileAccessLevel | null;
  onChange: (level: DriveFileAccessLevel & 'remove') => void;
  canRemove?: boolean;
  className?: string;
  hiddenLevels?: string[];
}) => {
  return (
    <Select
      disabled={disabled}
      className={
        className +
        ' w-auto ' +
        (level === 'none' ? '!text-rose-500 !bg-rose-100 dark-bg-rose-800' : '')
      }
      value={level || 'none'}
      onChange={e => onChange(e.target.value as DriveFileAccessLevel & 'remove')}
    >
      {!hiddenLevels?.includes('manage') && <option value={'manage'}>{Languages.t('common.access-level_full_acess')}</option>}
      {!hiddenLevels?.includes('write') && <option value={'write'}>{Languages.t('common.access-level_write')}</option>}
      {!hiddenLevels?.includes('read') && <option value={'read'}>{Languages.t('common.access-level_read')}</option>}
      {!hiddenLevels?.includes('none') && <option value={'none'}>{Languages.t('common.access-level_no_access')}</option>}
      {canRemove && <option value={'remove'}>Remove</option>}
    </Select>
  );
};
