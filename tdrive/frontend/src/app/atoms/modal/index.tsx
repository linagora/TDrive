/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { DismissIcon } from '../icons-colored';
import { Title } from '../text';

const ModalsCountState = atom({
  key: 'ModalsState',
  default: 0,
});

let visibleModals = 0;

export const Modal = (props: {
  open?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  closable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  positioned?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [, setModalsCountState] = useRecoilState(ModalsCountState);
  const [level, setLevel] = useState(0);
  const [didOpenOnce, setDidOpenOnce] = useState(false);

  const onClose = useCallback(() => {
    visibleModals += -1;
    setModalsCountState(visibleModals);
  }, [setModalsCountState]);

  const onOpen = useCallback(() => {
    visibleModals += 1;
    setLevel(visibleModals);
    setModalsCountState(visibleModals);
  }, [setModalsCountState]);

  useEffect(() => {
    if (props.open !== open) {
      setOpen(props.open || false);
      if (props.open) {
        onOpen();
      } else {
        onClose();
      }
    }
    if (!didOpenOnce && props.open) setDidOpenOnce(true);
  }, [props.open]);

  useEffect(() => {
    return () => {
      if (open) onClose();
    };
  }, []);

  const zIndex = 'z-' + level + '0';

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className={'relative ' + zIndex}
        onClose={() => props.onClose && props.closable && props.onClose()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 pointer-events-none"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 pointer-events-none"
        >
          <div
            className={
              'fixed inset-0 bg-opacity-25 dark:bg-opacity-75 transition-opacity ' +
              (level === 1 ? 'bg-black' : 'bg-transparent')
            }
          />
        </Transition.Child>

        <div
          className={
            'fixed z-10 inset-0 overflow-y-auto transition-transform ' +
            (level !== visibleModals && open
              ? '-translate-y-6 sm:scale-95 brightness-75 '
              : level !== visibleModals && !open
              ? 'translate-y-6 sm:scale-95 brightness-75 '
              : '')
          }
        >
          <div
            className={
              'flex items-end justify-center min-h-screen webkit-h-full text-center sm:block '
            }
          >
            {
              /* This element is to trick the browser into centering the modal contents. */
              !props.positioned && (
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
              )
            }
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 pointer-events-none translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 pointer-events-none translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={
                  'relative inline-block align-bottom bg-white dark:bg-zinc-900 rounded-tr-xl rounded-tl-xl sm:rounded-md px-4 pt-5 pb-4 text-left w-full overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full sm:p-4 ' +
                  (props.className || '')
                }
                style={props.style || {}}
              >
                {props.closable !== false && (
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                      type="button"
                      className="hover:opacity-75 focus:outline-none "
                      onClick={() => props.onClose && props.onClose()}
                    >
                      <DismissIcon />
                    </button>
                  </div>
                )}
                {didOpenOnce && props.children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export const ModalContent = (props: {
  title: ReactNode | string;
  text?: string;
  textCenter?: boolean;
  buttons?: ReactNode;
  children?: ReactNode;
  icon?: any;
  theme?: 'success' | 'danger' | 'warning' | 'gray';
}) => {
  let color = 'blue';
  if (props.theme === 'success') color = 'green';
  if (props.theme === 'danger') color = 'rose';
  if (props.theme === 'warning') color = 'orange';
  if (props.theme === 'gray') color = 'gray';
  return (
    <>
      <div className="sm:flex sm:items-start">
        {props.icon && (
          <div
            className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${color}-100 sm:mx-0 sm:h-10 sm:w-10`}
          >
            <props.icon className={`h-6 w-6 text-${color}-600`} aria-hidden="true" />
          </div>
        )}
        <div
          className={
            'w-full ' +
            (props.icon ? 'sm:ml-4 ' : '') +
            (props.textCenter ? 'text-center' : 'text-left')
          }
        >
          <Title className="pr-8 overflow-hidden text-ellipsis">{props.title}</Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{props.text || ''}</p>
          </div>
        </div>
      </div>
      {props.buttons && (
        <div
          className={
            'mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:text-left ' +
            (props.textCenter ? 'text-center' : 'text-left')
          }
        >
          {props.buttons}
        </div>
      )}
      {props.children}
    </>
  );
};
