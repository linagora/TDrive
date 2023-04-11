import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import MessageDeliveryStatus from './index';

export default {
  title: 'molecules/Message-delivery-status',
  component: MessageDeliveryStatus,
} as ComponentMeta<typeof MessageDeliveryStatus>;

const Template: ComponentStory<typeof MessageDeliveryStatus> = (args) => <MessageDeliveryStatus {...args} />;

export const sending = Template.bind({});
export const sent = Template.bind({});
export const deliverd = Template.bind({});
export const read = Template.bind({});
export const error = Template.bind({});
export const oldMessage = Template.bind({});

sending.args = {
  status: 'sending',
};

sent.args = {
  status: 'sent',
};

deliverd.args = {
  status: 'delivered',
};

read.args = {
  status: 'read',
};

error.args = {
  status: 'error',
};

oldMessage.args = {
  status: null,
};
