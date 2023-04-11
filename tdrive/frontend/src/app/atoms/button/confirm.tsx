/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/outline';
import _ from 'lodash';
import { useState } from 'react';
import { Button } from './button';
import { Modal, ModalContent } from '../modal';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'primary' | 'secondary' | 'danger' | 'default' | 'outline';
  size?: 'md' | 'lg' | 'sm';
  icon?: (props: any) => JSX.Element;
  loading?: boolean;
  disabled?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmIcon?: React.ReactNode;
  confirmButtonTheme?: 'primary' | 'secondary' | 'danger' | 'default';
  confirmButtonText?: string;
  cancelButtonText?: string;
  children?: React.ReactNode;
}

export const ButtonConfirm = (props: ButtonProps) => {
  const [inConfirm, setInConfirm] = useState(false);
  return (
    <>
      <Button
        {..._.omit(
          props,
          'onClick',
          'confirmButtonTheme',
          'confirmButtonText',
          'cancelButtonText',
          'confirmTitle',
          'confirmMessage',
          'confirmIcon',
        )}
        onClick={() => {
          setInConfirm(true);
        }}
      />
      <Modal
        open={inConfirm}
        onClose={() => {
          setInConfirm(false);
        }}
      >
        <ModalContent
          title={props.confirmTitle || 'Confirm action ?'}
          text={props.confirmMessage || 'Confirm action by clicking Confirm.'}
          icon={props.confirmIcon || ExclamationCircleIcon}
          buttons={
            <>
              <Button
                theme={props.confirmButtonTheme || 'primary'}
                onClick={e => {
                  setInConfirm(false);
                  setTimeout(() => {
                    props.onClick && props.onClick(e);
                  }, 500);
                }}
                className="mr-4 my-2"
              >
                {props.confirmButtonText || 'Confirm'}
              </Button>
              <Button
                onClick={() => {
                  setInConfirm(false);
                }}
                theme="default"
                className={'mr-4 my-2 shadow-none'}
              >
                {props.cancelButtonText || 'Cancel'}
              </Button>
            </>
          }
        />
      </Modal>
    </>
  );
};
