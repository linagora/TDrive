/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Avatar, Col, Typography } from 'antd';
import UsersService from 'app/features/users/services/current-user-service';
import './elements.scss';
import { useUser } from 'app/features/users/hooks/use-user';

const { Text } = Typography;

type PropsType = {
  item: any;
};

const EmailRow = ({ email }: { email: string }): JSX.Element => {
  return (
    <>
      <div className="icon">
        <div className="user_head email">{email.indexOf('+') === 0 ? email : '@'}</div>
      </div>
      <div className="text" style={{ fontStyle: 'italic' }}>
        {email}
      </div>
    </>
  );
};

const UserRow = ({ id }: { id: string }): JSX.Element => {
  const user = useUser(id);

  if (user) {
    console.log(UsersService.getFullName(user));
  } else {
    console.log('user not found');
  }

  return user ? (
    <>
      <Col className="icon">
        <Avatar size={20} src={UsersService.getThumbnail(user)} />
      </Col>
      <Col
        className="text"
        flex="auto"
        style={{ overflow: 'auto', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
      >
        <Text strong>{UsersService.getFullName(user)}</Text>
        <Text>{user.email ? `, ${user.email}` : ''}</Text>
      </Col>
    </>
  ) : (
    <></>
  );
};

export default (props: PropsType): JSX.Element => {
  const id = props.item.id || props.item;

  if (
    typeof props.item == 'string' &&
    (props.item.indexOf('@') >= 0 || props.item.indexOf('+') === 0)
  ) {
    return <EmailRow email={props.item} />;
  } else {
    return <UserRow id={id} />;
  }
};
