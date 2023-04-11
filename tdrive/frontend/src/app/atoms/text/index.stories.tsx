/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ComponentStory } from '@storybook/react';

import * as Text from '.';

export default {
  title: '@atoms/text',
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<any> = (props: { text: string }) => (
  <>
    <Text.Title className="block">{props.text || 'Title'}</Text.Title>
    <br />
    <Text.Subtitle className="block">{props.text || 'Subtitle'}</Text.Subtitle>
    <br />
    <Text.Base className="block">{props.text || 'Base'}</Text.Base>
    <br />
    <Text.BaseSmall className="block">{props.text || 'BaseSmall'}</Text.BaseSmall>
    <br />
    <Text.Info className="block">{props.text || 'Info'}</Text.Info>
    <br />
    <Text.InfoSmall className="block">{props.text || 'InfoSmall'}</Text.InfoSmall>
    <br />
  </>
);

export const Default = Template.bind({});
Default.args = {
  text: '',
};
