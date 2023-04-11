import React, { useEffect, useState } from 'react';
import { Input, Col, Row, Select, Typography, Button, Divider, Tooltip } from 'antd';
import { ChannelType } from 'app/features/channels/types/channel';
import { List, X } from 'react-feather';
import Languages from 'app/features/global/services/languages-service';
import './input-with-select.scss';

type PropsType = {
  channel: ChannelType | undefined;
  onChange: (array: string[]) => void;
  groups: string[];
};

const { Group } = Input;
const { Option } = Select;
const InputWithSelect = ({ groups, channel, onChange }: PropsType): JSX.Element => {
  const [group, setGroup] = useState<string>(channel?.channel_group || '');
  const [channelName, setChannelName] = useState<string>(channel?.name || '');
  const [searchedGroup, setSearchedGroup] = useState<string>('');
  const [displaySelector, setDisplaySelector] = useState<boolean>(
    channel?.channel_group ? true : false,
  );

  useEffect(() => {
    onChange([group || '', channelName]);
  });

  return (
    <Group className="group-container">
      <Row style={{ flexWrap: 'nowrap' }}>
        {!displaySelector && (
          <Col>
            <Tooltip
              placement="top"
              title={Languages.t('components.inputs.input_with_select.button.tooltip')}
            >
              <Button
                type="default"
                onClick={() => setDisplaySelector(!displaySelector)}
                icon={<List size={14} className="small-margin-left" />}
              />
            </Tooltip>
          </Col>
        )}
        {displaySelector && (
          <Col>
            <Select
              onBlur={() => ((group || '').length === 0 ? setDisplaySelector(false) : undefined)}
              notFoundContent={
                <span className="info" style={{ color: 'var(--grey-dark)' }}>
                  {Languages.t('components.inputs.input_with_select.select.no_sections')}
                </span>
              }
              dropdownMatchSelectWidth={false}
              className={displaySelector ? 'border-radius-left' : ''}
              allowClear
              clearIcon={<X size={14} color="var(--grey-dark)" />}
              onClear={() => {
                setDisplaySelector(false);
                setGroup('');
              }}
              size={'large'}
              defaultValue={group || undefined}
              showSearch
              autoFocus={displaySelector}
              placeholder={Languages.t('components.inputs.input_with_select.select.placeholder')}
              onChange={(value: string) => setGroup(value)}
              onSearch={(value: string) => setSearchedGroup(value)}
              searchValue={searchedGroup.substr(0, 20)}
            >
              {searchedGroup.length > 0 && group !== searchedGroup && (
                <Option value={searchedGroup}>
                  {Languages.t('general.create')}{' '}
                  <Typography.Text strong>{searchedGroup}</Typography.Text>
                </Option>
              )}
              {groups.map((group: string, index: number) => {
                return (
                  <Option key={index} value={group}>
                    {group}
                  </Option>
                );
              })}
            </Select>
          </Col>
        )}
        <Col>
          <Divider type="vertical" className="group-divider" />
        </Col>
        <Col flex="auto">
          <Input
            autoFocus={!displaySelector}
            size={'large'}
            maxLength={30}
            placeholder={Languages.t('components.inputs.input_with_select.input.placeholder')}
            value={channelName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChannelName(e.target.value)}
          />
        </Col>
      </Row>
    </Group>
  );
};

export default InputWithSelect;
