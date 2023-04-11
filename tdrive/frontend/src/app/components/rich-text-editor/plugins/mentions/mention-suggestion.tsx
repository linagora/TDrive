import React from 'react';
import { MentionSuggestionType } from './index';
import UsersService from 'app/features/users/services/current-user-service';
import User from 'components/user/user';

export default (props: MentionSuggestionType): JSX.Element => {
  return (
    <>
      <div className="icon">
        <User user={props} small />
      </div>
      <div className="text">{UsersService.getFullName(props)} </div>
    </>
  );
};
