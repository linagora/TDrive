/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ComponentStory } from '@storybook/react';
import ChannelBlock from '.';
import Avatar from '@atoms/avatar';

export default {
  title: '@molecules/avatar-block',
};

const Template: ComponentStory<any> = (props: {
  title: string;
  subtitle: string;
  badge: string;
  date: string;
}) => {
  return (
    <div className="flex">
      <div className="w-96 border border-gray-300 rounded-sm px-2 m-2">
        <ChannelBlock
          avatar={
            <Avatar avatar="https://images.freeimages.com/images/small-previews/d67/experimenting-with-nature-1547377.jpg" />
          }
          title={props.title}
          subtitle={props.subtitle}
          date={props.date}
          suffix={
            <div className="flex text-center">
              <div className="bg-blue-500 rounded-full text-white px-1.5 min-w-[24px]">
                {props.badge}
              </div>
            </div>
          }
          className="py-2 border-b border-gray-300"
        />
        <ChannelBlock
          avatar={<Avatar title="Test Company" />}
          title="Test company"
          subtitle="Just a test company"
          className="py-2"
        />
      </div>
    </div>
  );
};

export const Channel = Template.bind({});
Channel.args = {
  title: 'Channel name',
  subtitle: 'Channel description',
  date: '19:00',
  badge: '1',
};
