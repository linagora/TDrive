import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Logo } from '.';

export default {
  title: '@atoms/logo',
  component: Logo,
} as ComponentMeta<typeof Logo>;

const Template: ComponentStory<typeof Logo> = args => <Logo {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const extraSmall = Template.bind({});
extraSmall.args = {
  size: 16,
};

export const small = Template.bind({});
small.args = {
  size: 32,
};

export const mediumSmall = Template.bind({});
mediumSmall.args = {
  size: 64,
};

export const medium = Template.bind({});
medium.args = {
  size: 128,
};

export const large = Template.bind({});
large.args = {
  size: 256,
};
