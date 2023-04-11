import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import DownloadAppBanner from './index';

export default {
  title: 'molecules/download-app-banner',
  component: DownloadAppBanner,
} as ComponentMeta<typeof DownloadAppBanner>;

const Template: ComponentStory<typeof DownloadAppBanner> = args => <DownloadAppBanner {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  download: () => {
    console.log('Download');
  },
  onBannerClose: () => {
    console.log('Close');
  },
};
