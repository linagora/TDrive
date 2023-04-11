import Select from 'app/atoms/input/input-select';
import { DriveFileAccessLevel } from 'app/features/drive/types';

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
      {!hiddenLevels?.includes('manage') && <option value={'manage'}>Full access</option>}
      {!hiddenLevels?.includes('write') && <option value={'write'}>Write</option>}
      {!hiddenLevels?.includes('read') && <option value={'read'}>Read</option>}
      {!hiddenLevels?.includes('none') && <option value={'none'}>No access</option>}
      {canRemove && <option value={'remove'}>Remove</option>}
    </Select>
  );
};
