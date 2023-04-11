/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentStory } from '@storybook/react';
import { SearchIcon } from '@heroicons/react/solid';
import { Title } from '@atoms/text';
import { Input } from '../input-text';
import { FilterIcon, CogIcon } from '@heroicons/react/outline';
import Select from '../input-select';
import { InputDecorationIcon } from '../input-decoration-icon';

export default {
  title: '@atoms/input-groups',
};

const Template: ComponentStory<any> = () => {
  return (
    <>
      <Title>Icons</Title>
      <br />

      <InputDecorationIcon
        prefix={SearchIcon}
        input={({ className }) => <Input className={className} placeholder="Awesome text" />}
      />
      <br />

      <InputDecorationIcon
        suffix={FilterIcon}
        input={({ className }) => <Input className={className} placeholder="Awesome text" />}
      />
      <br />

      <InputDecorationIcon
        prefix={SearchIcon}
        suffix={FilterIcon}
        input={({ className }) => <Input className={className} placeholder="Awesome text" />}
      />
      <br />

      <InputDecorationIcon
        prefix={SearchIcon}
        suffix={FilterIcon}
        input={({ className }) => (
          <Input className={className} multiline placeholder="Awesome text" />
        )}
      />
      <br />

      <InputDecorationIcon
        prefix={SearchIcon}
        input={({ className }) => (
          <Select className={className}>
            <option>Option 1</option>
          </Select>
        )}
      />

      <br />
      <br />
      <Title>Groups</Title>
      <br />

      <div className="relative flex">
        <Input className="grow rounded-tr-none rounded-br-none mr-px" placeholder="Awesome text" />
        <Select className="w-auto rounded-tl-none rounded-bl-none">
          <option>Option 1</option>
        </Select>
      </div>

      <br />
      <br />
      <Title>Mixed</Title>
      <br />

      <div className="relative flex">
        <InputDecorationIcon
          className="grow mr-px"
          prefix={SearchIcon}
          suffix={CogIcon}
          input={({ className }) => (
            <Input
              className={className + ' rounded-tr-none rounded-br-none'}
              placeholder="Awesome text"
            />
          )}
        />
        <InputDecorationIcon
          className=""
          prefix={FilterIcon}
          input={({ className }) => (
            <Select
              className={className + 'pl-9 w-auto rounded-tl-none rounded-bl-none text-opacity-50'}
            >
              <option>company</option>
              <option>channel</option>
            </Select>
          )}
        />
      </div>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  text: 'Text',
  disabled: false,
};
