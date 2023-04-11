/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ComponentStory } from '@storybook/react';
import { useArgs } from '@storybook/client-api';

import Tabs from '.';

export default {
  title: '@molecules/tabs',
};

const Template: ComponentStory<any> = (args: { activeTab: number; badgeContent: string }) => {
  const [_, updateArgs] = useArgs();

  const tabs = [
    <div key="all">All</div>,
    <div key="chats">Chats</div>,
    <div key="media" className="flex">
      <div>Media</div>{' '}
      {(args.badgeContent && (
        <div className="bg-blue-500 ml-1 px-2 rounded-full text-white">{args.badgeContent}</div>
      )) || <></>}
    </div>,
    <div key="media">Files</div>,
  ];

  return (
    <>
      <Tabs
        tabs={tabs}
        selected={args.activeTab}
        onClick={idx => {
          updateArgs({ activeTab: idx });
          // console.log(args);
        }}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  activeTab: 0,
  badgeContent: '12',
};
