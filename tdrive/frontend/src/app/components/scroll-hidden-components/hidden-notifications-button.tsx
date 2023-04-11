import React, { FC } from 'react';

import { ArrowUp, ArrowDown } from 'react-feather';
import { Button } from 'antd';
import Languages from 'app/features/global/services/languages-service';
import './notifications.scss';

type PropsType = {
  icon?: React.ReactNode;
  iconSize?: number;
  position: 'top' | 'bottom';
  type?: 'primary' | 'secondary' | 'warning' | 'important' | undefined;
  children?: JSX.Element | string;
  onClick?: ((event: React.MouseEvent<HTMLElement, MouseEvent>) => void) | undefined;
};

const HiddenNotificationsButton: FC<PropsType> = ({
  children,
  icon,
  iconSize,
  position,
  type,
  onClick,
}) => {
  const setDefaultIcon = (): React.ReactNode => {
    const defaultSize = iconSize ? iconSize : 16;

    switch (position) {
      case !icon && 'top':
        return <ArrowUp size={defaultSize} />;
      case !icon && 'bottom':
        return <ArrowDown size={defaultSize} />;
      case icon:
      case icon && 'top':
      case icon && 'bottom':
        return icon;
    }
  };

  return (
    <Button
      icon={setDefaultIcon()}
      className={`hidden-notifications-button ${type ? type : 'primary'} ${position}`}
      onClick={onClick && onClick}
    >
      {(children && children) ||
        Languages.t('components.notifications.hidden_notifications_button.children')}
    </Button>
  );
};

export default HiddenNotificationsButton;
