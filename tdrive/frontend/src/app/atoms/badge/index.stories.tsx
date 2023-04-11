/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentStory } from '@storybook/react';
import { Badge } from '.';
import { PlusIcon, SearchIcon } from '@heroicons/react/solid';
import { TrashIcon } from '@heroicons/react/outline';

export default {
  title: '@atoms/button',
};

const Template: ComponentStory<any> = (props: {
  text: string;
  disabled: boolean;
  loading: boolean;
}) => {
  return (
    <>
      <Badge className="my-4 mx-2" loading={props.loading}>
        {props.text}
      </Badge>

      <Badge className="my-4 mx-2" theme="secondary" loading={props.loading}>
        {props.text}
      </Badge>

      <Badge className="my-4 mx-2" theme="danger" loading={props.loading}>
        {props.text}
      </Badge>

      <Badge className="my-4 mx-2" theme="default" loading={props.loading}>
        {props.text}
      </Badge>

      <Badge className="my-4 mx-2" theme="outline" loading={props.loading}>
        {props.text}
      </Badge>

      <br />

      <Badge className="my-4 mx-2" loading={props.loading} icon={SearchIcon}>
        Search
      </Badge>

      <Badge className="my-4 mx-2" theme="outline" loading={props.loading} icon={PlusIcon}>
        Add
      </Badge>

      <Badge className="my-4 mx-2" theme="danger" loading={props.loading} icon={TrashIcon} />

      <br />

      <Badge size="lg" className="my-4 mx-2" theme="outline" loading={props.loading}>
        {props.text}
      </Badge>

      <Badge size="md" className="my-4 mx-2" theme="outline" loading={props.loading}>
        {props.text}
      </Badge>

      <Badge size="sm" className="my-4 mx-2" theme="outline" loading={props.loading}>
        {props.text}
      </Badge>

      <br />

      <Badge
        size="lg"
        className="my-4 mx-2 rounded-full"
        theme="primary"
        loading={props.loading}
        icon={TrashIcon}
      />

      <Badge
        className="my-4 mx-2 rounded-full"
        theme="primary"
        loading={props.loading}
        icon={TrashIcon}
      />

      <Badge
        size="sm"
        className="my-4 mx-2 rounded-full"
        theme="primary"
        loading={props.loading}
        icon={TrashIcon}
      />

      <br />

      <Badge
        size="md"
        className="my-4 mx-2 w-full justify-center"
        theme="outline"
        loading={props.loading}
        icon={PlusIcon}
      >
        Add
      </Badge>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  text: 'Text',
  loading: false,
};
