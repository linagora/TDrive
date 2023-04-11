/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentStory } from '@storybook/react';
import Avatar from '.';
import { UsersIcon } from '../icons-agnostic';

export default {
  title: '@atoms/avatar',
};
type sizeType = 'lg' | 'md' | 'sm';
type shapeType = 'circle' | 'square';

const Template: ComponentStory<any> = (args: { title: string }) => {
  const types = ['circle', 'square'] as shapeType[];
  const sizes = ['lg', 'md', 'sm'] as sizeType[];
  const values = [
    { title: args.title },
    {
      title: args.title,
      avatar:
        'https://images.freeimages.com/images/small-previews/d67/experimenting-with-nature-1547377.jpg',
    },
    {
      icon: <UsersIcon />,
      className: '',
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-2">
        {sizes.map(size => (
          <div key={size} className="flex gap-2">
            {types.map(tp =>
              values.map(val => (
                <Avatar
                  key={tp}
                  size={size}
                  title={val.title}
                  type={tp}
                  avatar={val.avatar}
                  icon={val.icon}
                  className={val.className}
                />
              )),
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'User Name',
};
