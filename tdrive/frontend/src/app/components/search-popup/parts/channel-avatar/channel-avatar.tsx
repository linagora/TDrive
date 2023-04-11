import { ChannelType } from 'features/channels/types/channel';
import React from 'react';
import './channel-avatar.scss';
import UsersService from 'features/users/services/current-user-service';
import UserService from 'features/users/services/current-user-service';
import { UserType } from 'features/users/types/user';
import { addApiUrlIfNeeded } from 'features/global/utils/URLUtils';
import emoji from 'emoji-name-map';
import _ from 'lodash';

type PropsType = {
  channel: ChannelType;
  showLabel: boolean;
  collapseToOne?: boolean;
};

export default ({ channel, showLabel, collapseToOne }: PropsType): JSX.Element => {
  if (channel.visibility === 'direct') {
    let channelUsers = _.uniqBy(channel.users || [], 'id')
      .filter(e => e.id !== UsersService.getCurrentUserId() || channel.users?.length === 1)
      .filter(a => a);

    if (channelUsers.length === 0) {
      channelUsers = [UsersService.getCurrentUser()];
    }

    const channelName: string[] = [];

    const icons = [] as JSX.Element[];

    channelUsers.forEach(member => {
      channelName.push(UserService.getFullName(member));
      if (!(collapseToOne && icons.length > 0)) {
        icons.push(getThumbnail(member));
      }
    });

    let width = 64;

    if (!collapseToOne && channelUsers.length > 1) {
      const shift = 64 - (64 * 2) / 5;
      width = 64 + (channelUsers.length - 1) * shift;
    }

    return (
      <div className="component-channel-avatar">
        <div className="channel-icon-container">{icons.map(icon => icon)}</div>
        {showLabel && (
          <div className="channel-label" style={{ width: width }}>
            {channelName.join(', ')}
          </div>
        )}
      </div>
    );
  }

  let thumbnail;
  const label = channel?.name;

  if (channel.icon) {
    thumbnail = emoji.get(channel.icon);
  }

  if (!thumbnail && channel.name) {
    thumbnail = '';
    const channelName =
      channel.name.indexOf(' ') < 0 ? channel.name.replace('_', ' ') : channel.name;
    const split = channelName.toUpperCase().split(' ');
    thumbnail += (split?.[0]?.[0] || '') + (split?.[1]?.[0] || '');
  }

  const style = getStyle(channel.id);

  return (
    <div className="component-channel-avatar">
      <div className={'channel-icon-wrapper' + style}>
        <div className="channel-icon-text">{thumbnail}</div>
      </div>
      {showLabel && <div className="channel-label">{label}</div>}
    </div>
  );
};

const getStyle = (id?: string) => {
  if (!id) return '';
  let output = 0;
  for (let i = 0; i < id.length; i++) {
    output += id[i].charCodeAt(0);
  }
  const i = (output % 10) + 1;
  return ` style${i}`;
};

const getThumbnail = (user: UserType) => {
  let inner;
  let style = '';
  if (user && (user.thumbnail || user.picture)) {
    const thumbnail = addApiUrlIfNeeded(user.picture || user.thumbnail || '');
    inner = <img alt={user.first_name} className="channel-icon-img" src={thumbnail} />;
  } else {
    const fullName = UserService.getFullName(user).toUpperCase().split(' ');
    const letters = (fullName?.[0]?.[0] || '?') + (fullName?.[1]?.[0] || '');
    inner = <div className="channel-icon-text">{letters}</div>;
    style = getStyle(user.id);
  }

  return <div className={`channel-icon-wrapper${style}`}>{inner}</div>;
};
