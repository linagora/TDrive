/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import UserService from 'app/features/users/services/current-user-service';
import MenusManager from 'app/components/menus/menus-manager.jsx';
import UserCard from 'app/components/user-card/user-card';
import { UserType } from 'app/features/users/types/user';
import { useUser, useUserByUsername } from 'app/features/users/hooks/use-user';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections';
import { useDirectChannels } from 'app/features/channels/hooks/use-direct-channels';

const globalMentions = ['channel', 'everyone', 'all', 'here'];

type PropsType = {
  // User id
  id?: string;
  // user username
  username?: string;
  // should we hide the user image?
  hideUserImage?: boolean;
};

export default (props: PropsType): JSX.Element => {
  const { openDiscussion } = useDirectChannels();
  const collection = Collections.get('users');
  const nodeRef = useRef<HTMLDivElement>(null);
  let user: UserType | undefined;
  if (props.id) {
    user = useUser(props.id || '');
  } else {
    user = useUserByUsername(props.username || '');
  }

  useEffect(() => {
    const listener = collection.addListener(useState, [user]);

    return () => {
      collection.removeListener(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const displayUserCard = (user: UserType): void => {
    if (!nodeRef.current) {
      return;
    }

    MenusManager.openMenu(
      [
        {
          type: 'react-element',
          reactElement: () => (
            <UserCard user={user} onClick={() => openDiscussion([user.id || ''])} />
          ),
        },
      ],
      (window as any).getBoundingClientRect(nodeRef.current),
      null,
      { margin: 8 },
    );
  };

  const highlighted =
    user?.id === UserService.getCurrentUserId() ||
    globalMentions.includes(props.username || props.id || '');

  if (user) {
    return (
      <div
        ref={nodeRef}
        className={classNames('user_twacode with_user', {
          highlighted: highlighted && !props.hideUserImage,
        })}
        onClick={() => displayUserCard(user as UserType)}
        style={{
          paddingLeft: props.hideUserImage ? 5 : 0,
          backgroundColor: props.hideUserImage ? 'var(--grey-background)' : '',
        }}
      >
        {!props.hideUserImage && (
          <div
            className="userimage"
            style={{ backgroundImage: `url('${UserService.getThumbnail(user)}')` }}
          />
        )}
        {UserService.getFullName(user)}
      </div>
    );
  } else {
    return (
      <span className={classNames('user_twacode', { highlighted })}>
        @{props.username || 'unknown'}
      </span>
    );
  }
};
