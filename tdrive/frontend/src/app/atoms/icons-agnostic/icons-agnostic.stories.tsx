/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { cloneElement } from 'react';
import { ComponentStory } from '@storybook/react';
import {
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  EyeIcon,
  InputClearIcon,
  ShareIcon,
  UserAddIcon,
  CheckIcon,
  ZoomInIcon,
  ZoomOutIcon,
  VerticalDotsIcon,
  RotateCwIcon,
  UploadCwIcon,
  PlusIcon,
  UpIcon,
  XIcon,
  StatusCheckDoubleIcon,
  StatusCheckIcon,
  UsersIcon,
  CheckOutlineIcon,
} from '@atoms/icons-agnostic/index';

export default {
  title: '@atoms/icons-agnostic',
};

type PropsType = {
  icon: JSX.Element;
  title: string;
};

const Icon = ({ icon, title }: PropsType): JSX.Element => {
  const comp = cloneElement(icon, { className: 'w-8 h-8' });

  return (
    <div className="flex flex-col place-items-center w-[90px] my-3">
      {comp}
      <div className="m-2 text-xs text-zinc-500 break-words max-w-[68px] text-center">{title}</div>
    </div>
  );
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<any> = () => {
  return (
    <>
      <div className="flex flex-wrap mb-2">
        <Icon icon={<CopyIcon />} title="Copy" />
        <Icon icon={<DeleteIcon />} title="Delete" />
        <Icon icon={<DownloadIcon />} title="Download" />
        <Icon icon={<EyeIcon />} title="Eye" />
        <Icon icon={<ShareIcon />} title="Share" />
        <Icon icon={<InputClearIcon />} title="InputClear" />
        <Icon icon={<UserAddIcon />} title="User" />
        <Icon icon={<CheckIcon />} title="Check" />
        <Icon icon={<CheckOutlineIcon />} title="CheckOutline" />
        <Icon icon={<ZoomInIcon />} title="ZoomIn" />
        <Icon icon={<ZoomOutIcon />} title="ZoomOut" />
        <Icon icon={<VerticalDotsIcon />} title="VerticalDots" />
        <Icon icon={<RotateCwIcon />} title="RotateCw" />
        <Icon icon={<UploadCwIcon />} title="Upload" />
        <Icon icon={<PlusIcon />} title="Plus" />
        <Icon icon={<UpIcon />} title="Up" />
        <Icon icon={<XIcon />} title="X" />
        <Icon icon={<StatusCheckDoubleIcon />} title="StatusCheckDouble" />
        <Icon icon={<StatusCheckIcon />} title="StatusCheck" />
        <Icon icon={<UsersIcon />} title="Users" />
      </div>
    </>
  );
};

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
