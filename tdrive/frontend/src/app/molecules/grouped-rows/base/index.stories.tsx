/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ComponentStory } from '@storybook/react';

import Block from '.';
import Avatar from '@atoms/avatar';
import { CheckIcon } from '@atoms/icons-agnostic';

export default {
  title: '@molecules/avatar-block',
};

const Template: ComponentStory<any> = (props: {
  title: string;
  subtitle: string;
  badge: string;
  postfix: string;
  title_suffix: string;
}) => {
  return (
    <div className="flex">
      <div className="w-96 border border-gray-300 rounded-sm px-2 m-2">
        <Block
          avatar={<Avatar title="Software" type="square" />}
          title={<div>Software</div>}
          subtitle="Workspace containing channels about software development"
          className="py-2 border-b border-gray-300"
        />
        <Block
          avatar={<Avatar title="Ecosystem" type="square" />}
          title={<div>Ecosystem</div>}
          subtitle="Ecosystem containing channels about ecosystems"
          suffix={
            <div className="text-blue-500">
              <CheckIcon fill="currentColor" />
            </div>
          }
          className="py-2 border-b border-gray-300"
        />
        <Block
          avatar={
            <Avatar
              avatar="https://images.freeimages.com/images/small-previews/d67/experimenting-with-nature-1547377.jpg"
              type="square"
            />
          }
          title={<div>Romaric Morgues</div>}
          subtitle="r.mourgues@linagora.com"
          className="py-2"
        />
      </div>
      <div className="w-96 border border-gray-300 rounded-sm px-2 m-2">
        <Block
          avatar={<Avatar title={props.title} />}
          title={props.title}
          title_suffix={props.title_suffix}
          subtitle={props.subtitle}
          subtitle_suffix={
            <div className="flex text-center">
              <div className="bg-blue-500 rounded-full text-white px-1.5  min-w-[24px">
                {props.badge}
              </div>
            </div>
          }
          suffix={props.postfix}
          className="py-2 border-b border-gray-300"
        />
        <Block
          avatar={<Avatar title="Lng Core" />}
          title={<div>Lng Core</div>}
          subtitle="Anders is typing"
          subtitle_suffix={
            <div className="flex text-center">
              <div className="bg-blue-500 rounded-full text-white min-w-[24px]">@</div>
              <div className="bg-blue-500 rounded-full text-white min-w-[24px] ml-1">1</div>
            </div>
          }
          className="py-2 border-b border-gray-300"
        />

        <Block
          avatar={<Avatar title="Anders Meyer" />}
          title={<div>Anders Meyer</div>}
          title_suffix="2 min ago"
          subtitle="More content to upload i would like to produce"
          subtitle_suffix={
            <div className="flex text-center">
              <div className="bg-blue-500 rounded-full text-white min-w-[24px] ml-1">3</div>
            </div>
          }
          className="py-2"
        />
      </div>
    </div>
  );
};

export const Base = Template.bind({});
Base.args = {
  title: 'Some very long dynamic title',
  title_suffix: '19:00 of current day',
  subtitle: 'Some very long dynamic subtitle',
  badge: 'very long badge',
  postfix: '',
};
