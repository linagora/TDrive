/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ComponentStory } from '@storybook/react';
import { ButtonConfirm } from './confirm';
import { RecoilRoot } from 'recoil';

export default {
  title: '@atoms/button-confirm',
};

const Template: ComponentStory<any> = (props: {
  text: string;
  disabled: boolean;
  loading: boolean;
}) => {
  return (
    <RecoilRoot>
      <ButtonConfirm className="m-4" disabled={props.disabled} loading={props.loading}>
        {props.text}
      </ButtonConfirm>
      <br />
      <ButtonConfirm
        className="m-4"
        theme="secondary"
        disabled={props.disabled}
        loading={props.loading}
      >
        {props.text}
      </ButtonConfirm>
      <br />
      <ButtonConfirm
        className="m-4"
        theme="danger"
        disabled={props.disabled}
        loading={props.loading}
      >
        {props.text}
      </ButtonConfirm>
      <br />
      <ButtonConfirm
        className="m-4"
        theme="default"
        disabled={props.disabled}
        loading={props.loading}
      >
        {props.text}
      </ButtonConfirm>
    </RecoilRoot>
  );
};

export const Default = Template.bind({});
Default.args = {
  text: 'Text',
  loading: false,
  disabled: false,
};
