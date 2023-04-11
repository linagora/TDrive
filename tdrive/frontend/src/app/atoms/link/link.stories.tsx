import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import A from './index';

export default {
  title: '@atoms/link',
  component: A,
  decorators: [(Story) => (<MemoryRouter><Story/></MemoryRouter>)]
} as ComponentMeta<typeof A>;

const Template: ComponentStory<typeof A> = args => <A {...args} />;

export const Default = Template.bind({});
Default.args = {
  href: 'https://www.google.com',
  children: 'Link',
}

export const noColor = Template.bind({});
noColor.args = {
  href: 'https://www.google.com',
  children: 'Link',
  noColor: true,
};

export const internal = Template.bind({});
internal.args = {
  to: '/',
  children: 'Link',
};
