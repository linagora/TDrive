/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Emojione from 'components/emojione/emojione';
import Button from 'components/buttons/button';
import Languages from 'app/features/global/services/languages-service';
import User from 'components/user/user';
import UserService from 'app/features/users/services/current-user-service';
import { UserType } from 'app/features/users/types/user';
import './user-card.scss';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import { TrashIcon } from '@heroicons/react/outline';

type PropsType = {
  user: UserType;
  onClick: (evt: any) => void;
};

export default (props: PropsType): JSX.Element => {
  const companyId = useRouterCompany();

  return (
    <>
      {!UserService.isInCompany(props.user, companyId) && (
        <div className="text-white bg-zinc-700 flex items-center content-center -mt-4 -mx-4 mb-2 text-center text-xs p-2">
          <TrashIcon className="h-4 w-4 inline-block" />
          <span className="text-white ml-1">{Languages.t('general.user.deactivated')}</span>
        </div>
      )}
      <div className="user-card allow_selection">
        <div className="content-popup small-bottom-margin">
          <div className="avatar">
            <User withStatus big user={props.user} />
          </div>
          <div className="texts">
            <div className="text-ellipsis title">{UserService.getFullName(props.user)}</div>
            <div className="text-ellipsis">{`@${(props.user || {}).username || ''}`}</div>
          </div>
        </div>
        <div className="mail-container small-y-margin">
          <Emojione type=":envelope_with_arrow:" />
          <a href={`mailto:${props.user.email}`}>{props.user.email}</a>
        </div>
        {UserService.isInCompany(props.user, companyId) && (
          <div className="footer">
            <Button
              type="button"
              value={Languages.t('general.send', [], 'Save')}
              onClick={props.onClick}
            />
          </div>
        )}
      </div>
    </>
  );
};
