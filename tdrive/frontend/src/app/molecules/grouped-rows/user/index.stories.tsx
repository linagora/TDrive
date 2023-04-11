/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ComponentStory } from '@storybook/react';

import UserBlock from '.';
import Avatar from '@atoms/avatar';
import { CheckIcon } from '@atoms/icons-agnostic';

export default {
  title: '@molecules/avatar-block',
};

const Template: ComponentStory<any> = (props: {
  title: string;
  subtitle: string;
  checked: boolean;
}) => {
  return (
    <div className="flex">
      <div className="w-96 border border-gray-300 rounded-sm px-2 m-2">
        <UserBlock
          avatar={
            <Avatar avatar="https://images.freeimages.com/images/small-previews/d67/experimenting-with-nature-1547377.jpg" />
          }
          title="Romaric Mourgues"
          subtitle="r.mourgues@linagora.com"
          suffix={
            <div className="text-blue-500">
              <CheckIcon fill="currentColor" />
            </div>
          }
          className="py-2 border-b border-gray-300"
        />
        <UserBlock
          avatar={<Avatar title="Diana Potokina" />}
          title="Diana Potokina"
          subtitle="r.potokina@linagora.com"
          className="py-2 border-b border-gray-300"
        />
        <UserBlock
          avatar={<Avatar title={props.title} />}
          title={props.title}
          subtitle={props.subtitle}
          suffix={
            (props.checked && (
              <div className="text-blue-500">
                <CheckIcon fill="currentColor" />
              </div>
            )) || <></>
          }
          className="py-2"
        />
      </div>
    </div>
  );
};

export const User = Template.bind({});
User.args = {
  title: 'Another user',
  subtitle: 'Just a test user',
  checked: false,
};
