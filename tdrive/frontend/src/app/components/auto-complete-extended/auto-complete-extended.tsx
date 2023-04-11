/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ReactElement } from 'react';
import { AutoComplete } from 'antd';
import { AutoCompleteProps } from 'antd/lib/auto-complete';

const { Option } = AutoComplete;

export default (
  props: {
    maxItems?: number;
    render?: (item: any) => ReactElement;
    onSearch?: (query: string, callback: (res: string[]) => void) => void;
    onSelect?: (id: string) => void;
    align?: 'top' | 'bottom';
  } & Omit<AutoCompleteProps, 'onSearch' | 'onSelect'>,
) => {
  const [list, setList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  const resetInputValue = () => setInputValue('');

  return (
    <AutoComplete
      {...props}
      dropdownAlign={
        props.align === 'top'
          ? {
              points: ['bl', 'tl'], // align dropdown bottom-left to top-left of input element
              offset: [0, -4], // align offset
              overflow: {
                adjustX: 0,
                adjustY: 0, // do not auto flip in y-axis
              },
            }
          : {}
      }
      onSearch={(text: string) => {
        props.onSearch &&
          props.onSearch(text, (res: any[]) => {
            setList(res);
          });
      }}
      value={inputValue}
      onSelect={(id: string) => {
        resetInputValue();
        props.onSelect && props.onSelect(id);
      }}
      onChange={e => setInputValue(e || '')}
    >
      {list.slice(0, props.maxItems || 10).map((item: any) => {
        return item ? (
          <Option key={item} value={item || ''}>
            {props.render ? props.render(item) : item?.id}
          </Option>
        ) : (
          <></>
        );
      })}
    </AutoComplete>
  );
};
