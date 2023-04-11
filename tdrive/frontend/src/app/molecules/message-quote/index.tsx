/* eslint-disable @typescript-eslint/no-empty-function */
import { Info } from 'app/atoms/text';
import Languages from 'app/features/global/services/languages-service';
import { XIcon } from '@atoms/icons-agnostic';

type PropsType = {
  message: JSX.Element;
  author: string;
  closable?: boolean;
  deleted?: boolean;
  goToMessage?: () => void;
  onClose?: () => void;
  className?: string;
};

export default ({
  author,
  message,
  closable = true,
  onClose,
  deleted = false,
  goToMessage,
  className = '',
}: PropsType) => {
  const clickable = !closable;

  return (
    <div
      className={
        'flex flex-row pl-3 pr-2 relative ' +
        (className || '') +
        ' ' +
        (clickable ? 'cursor-pointer hover:bg-blue-100 hover:bg-opacity-50' : '')
      }
      onClick={!closable ? goToMessage : () => {}}
    >
      <div className="w-[3px] rounded-full bg-blue-500 absolute left-0 top-0 h-full"></div>
      <div className="grow w-full max-w-full">
        <h3 className="mt-0.5 -mb-0.5 text-xs text-blue-500">{author}</h3>
        <div className="text-xs truncate text-ellipsis">
          {deleted ? (
            <Info className="italic text-xs">{Languages.t('molecules.message_quote.deleted')}</Info>
          ) : (
            message
          )}
        </div>
      </div>
      {closable && onClose && (
        <div className="flex-none w-2">
          <XIcon
            className="cursor-pointer mt-1 float-right w-3 h-3 text-blue-500 hover:text-blue-600"
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>
      )}
    </div>
  );
};
