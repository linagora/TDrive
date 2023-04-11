/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentStory } from '@storybook/react';
import { Input } from '../input-text';
import { Title } from '../../text';
import { InputLabel } from '../input-decoration-label';

export default {
  title: '@atoms/input',
};

const Template: ComponentStory<any> = (props: {
  text: string;
  disabled: boolean;
  loading: boolean;
}) => {
  return (
    <div className="max-w-md">
      <Title>Sizes and themes plain / outline</Title>
      <br />

      <Input size="sm" disabled={props.disabled} placeholder="Awesome text" />
      <br />
      <Input size="md" disabled={props.disabled} placeholder="Awesome text" />
      <br />
      <Input size="lg" disabled={props.disabled} placeholder="Awesome text" />
      <br />

      <Input theme="outline" size="sm" disabled={props.disabled} placeholder="Awesome text" />
      <br />
      <Input theme="outline" size="md" disabled={props.disabled} placeholder="Awesome text" />
      <br />
      <Input theme="outline" size="lg" disabled={props.disabled} placeholder="Awesome text" />
      <br />
      <Title>Labels and errors</Title>
      <br />

      <Input disabled={props.disabled} placeholder="Awesome text" value={props.text} />
      <br />
      <InputLabel
        hasError
        label="Label and feedback"
        feedback="The feedback"
        input={
          <Input
            disabled={props.disabled}
            placeholder="Awesome text area"
            hasError
            value={props.text}
          />
        }
      />
      <br />
      <InputLabel
        label="Multi-line"
        feedback="Some non-error feedback"
        input={
          <Input
            disabled={props.disabled}
            placeholder="Awesome text area"
            value={props.text}
            multiline
          />
        }
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  text: 'Text',
  disabled: false,
};
