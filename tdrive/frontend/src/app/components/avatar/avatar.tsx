import React from 'react';

import { Avatar, AvatarProps, Image } from 'antd';

import './avatar.scss';

type PropsType = {
  url?: string;
  size?: number;
  shape?: AvatarProps['shape'];
  borderRadius?: React.CSSProperties['borderRadius'];
  fallback?: string;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
};

const AvatarComponent = ({ url, shape, size, borderRadius, fallback, onClick }: PropsType) => (
  <div onClick={onClick}>
    <Avatar
      className="avatar-component-container"
      shape={shape || 'square'}
      size={size}
      style={{ width: size || 24, height: size || 24 }}
      src={
        <Image
          src={url?.length ? url : fallback}
          style={{ width: size || 24, borderRadius: borderRadius || 4 }}
          preview={false}
        />
      }
    />
  </div>
);

export default AvatarComponent;
