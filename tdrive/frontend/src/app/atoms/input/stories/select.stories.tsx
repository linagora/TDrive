/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentStory } from '@storybook/react';
import { Title } from '@atoms/text';
import { InputLabel } from '../input-decoration-label';
import Select from '../input-select';

export default {
  title: '@atoms/select',
};

const Template: ComponentStory<any> = (props: {
  text: string;
  disabled: boolean;
  loading: boolean;
}) => {
  return (
    <div className="max-w-md">
      <Title>Sizes and with error</Title>
      <br />

      <Select size="sm" disabled={props.disabled}>
        <option>Option 1</option>
        <option>Option 2</option>
      </Select>
      <br />
      <Select size="md" disabled={props.disabled}>
        <option>Option 1</option>
        <option>Option 2</option>
      </Select>
      <br />
      <Select size="lg" hasError disabled={props.disabled}>
        <option>Option 1</option>
        <option>Option 2</option>
      </Select>
      <br />

      <Title>Labels</Title>
      <br />

      <InputLabel
        label="Some label"
        hasError
        feedback="Has error"
        input={
          <Select size="lg" hasError disabled={props.disabled}>
            <option>Option 1</option>
            <option>Option 2</option>
          </Select>
        }
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  disabled: false,
};
