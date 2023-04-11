import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import MessageQuote from './index';

export default {
  title: 'molecules/message-quote',
  component: MessageQuote,
} as ComponentMeta<typeof MessageQuote>;

const Template: ComponentStory<typeof MessageQuote> = args => <MessageQuote {...args} />;

export const Editing = Template.bind({});
export const Displaying = Template.bind({});
export const longMessage = Template.bind({});
export const deleted = Template.bind({});

Editing.args = {
  author: 'John Doe',
  message: <>'This is a message that is being quoted'</>,
  closable: true,
  onClose: () => {
    console.log('Closed');
  },
};

Displaying.args = {
  author: 'Jane Dove',
  message: <>'This is a quoted message while displaying it'</>,
  closable: false,
  onClose: () => {
    console.log('Closed');
  }
};

longMessage.args = {
  author: 'John Doe',
  message: <>`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vestibulum magna at tincidunt luctus.
    Etiam dignissim nec lorem ut porta. Mauris convallis lacinia orci, ut posuere nisi viverra vitae.
    Cras lacinia nisi sit amet nunc commodo, ac accumsan eros egestas. Nullam ligula quam, vestibulum eget lorem nec,
    molestie vulputate purus. Curabitur vel arcu eget odio auctor pharetra. Morbi aliquam cursus lacus et vestibulum.
    Phasellus sapien augue, vulputate id rutrum et, vehicula ac ante. Aenean volutpat purus ut ultricies porttitor.`</>,
  closable: true,
};

deleted.args = {
  author: 'Samir pesiron',
  message: <>'some deteled message'</>,
  deleted: true,
};
