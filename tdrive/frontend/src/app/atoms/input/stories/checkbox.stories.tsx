/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentStory } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '../input-checkbox';

export default {
  title: '@atoms/checkbox',
};

const Template: ComponentStory<any> = (props: { label: string; disabled: boolean }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="max-w-md">
      <Checkbox
        onChange={e => {
          setChecked(e);
        }}
        value={checked}
        disabled={props.disabled}
      />

      <br />

      <Checkbox
        onChange={e => {
          setChecked(e);
        }}
        value={checked}
        disabled={props.disabled}
        label={props.label}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  label: 'Checkbox label',
  disabled: false,
};
