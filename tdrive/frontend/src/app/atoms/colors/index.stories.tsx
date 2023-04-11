/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ComponentStory } from '@storybook/react';

export default {
  title: '@atoms/colors',
};

const Template: ComponentStory<any> = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-8">
        {['zink', 'red', 'orange', 'green', 'blue'].map(color => (
          <div key={color}>
            <div className="flex flex-col space-y-3 sm:flex-row text-xs sm:space-y-0 sm:space-x-4">
              <div className="w-16 shrink-0">
                <div className="h-10 flex flex-col justify-center">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                    {color}
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 grid grid-cols-5 2xl:grid-cols-10 gap-x-4 gap-y-3 2xl:gap-x-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div className="space-y-1.5" key={shade}>
                    <div
                      className={
                        'h-10 w-full rounded dark:ring-1 dark:ring-inset dark:ring-white/10 ' +
                        `bg-${color}-${shade}`
                      }
                    ></div>
                    <div className="px-0.5 md:flex md:justify-between md:space-x-2 2xl:space-x-0 2xl:block">
                      <div className="w-6 font-medium text-zinc-900 2xl:w-full dark:text-white">
                        {shade}
                      </div>
                      <div className="text-zinc-500 font-mono lowercase dark:text-zinc-400">
                        #...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
