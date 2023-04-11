/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
import {
  BellIcon,
  ChevronRightIcon,
  HandIcon,
  LinkIcon,
  LogoutIcon,
  PhotographIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/solid';
import Avatar from 'app/atoms/avatar';
import { UsersIcon } from 'app/atoms/icons-agnostic';
import A from 'app/atoms/link';
import { Loader } from 'app/atoms/loader';
import { Base, Info } from 'app/atoms/text';
import { useChannelMemberCurrentUser } from 'app/features/channel-members-search/hooks/member-hook';
import ChannelsMineAPIClient from 'app/features/channels/api/channels-mine-api-client';
import { useFavoriteChannels } from 'app/features/channels/hooks/use-favorite-channels';
import { ChannelType } from 'app/features/channels/types/channel';
import { isDirectChannel, isPrivateChannel } from 'app/features/channels/utils/utils';
import AlertManager from 'app/features/global/services/alert-manager-service';
import Languages from 'app/features/global/services/languages-service';
import { ToasterService } from 'app/features/global/services/toaster-service';
import { copyToClipboard } from 'app/features/global/utils/CopyClipboard';
import RouterServices from 'app/features/router/services/router-service';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import workspaceUserRightsService from 'app/features/workspaces/services/workspace-user-rights-service';
import Block from 'app/molecules/grouped-rows/base';
import { addUrlTryDesktop } from 'app/components/desktop-redirect';
import { useState } from 'react';

export const ChannelSettingsMenu = (props: {
  channel?: ChannelType;
  onEditChannel?: Function;
  onAccess?: Function;
  onMedias?: Function;
  onNotifications?: Function;
  onMembers?: Function;
  onFavorite?: Function;
  onClose?: Function;
}) => {
  const icon = props.channel?.icon || '';
  const name = props.channel?.name || '';

  const { user } = useCurrentUser();
  const canEdit =
    props.channel?.owner === user?.id || workspaceUserRightsService.hasWorkspacePrivilege();
  const isGuest = workspaceUserRightsService.isInvite();
  const isDirect = isDirectChannel(props.channel?.visibility || '');
  const canLeave = !isGuest || isDirect;
  const canRemove =
    user?.id === props.channel?.owner || workspaceUserRightsService.hasWorkspacePrivilege();

  return (
    <div className="w-screen max-w-sm p-4 -m-4">
      {!isDirect && (
        <>
          <Block
            onClick={() => {
              canEdit && props.onEditChannel && props.onEditChannel();
            }}
            className={
              '-mx-2 my-2 p-2 rounded-md ' +
              (canEdit ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800' : '')
            }
            title={<span className="capitalize">{name || ''}</span>}
            subtitle={
              canEdit ? (
                <Info>
                  <A>{Languages.t('scenes.app.channelsbar.channel_information')}</A>
                </Info>
              ) : (
                <></>
              )
            }
            avatar={<Avatar size="lg" avatar={icon.length > 20 ? icon : ''} title={name || ''} />}
            suffix={canEdit ? <ChevronRightIcon className="w-5 h-5 text-zinc-500" /> : <></>}
          />
          {canRemove && <RemoveBlock channel={props.channel} onLeave={props.onClose} />}

          <hr className="my-2 -mx-4" />
          <Block
            onClick={() => {
              canEdit && props.onAccess && props.onAccess();
            }}
            className={
              '-mx-2 my-1 p-2 rounded-md ' +
              (canEdit ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800' : '')
            }
            title={
              <Base className="font-semibold">
                {Languages.t('scenes.app.channelsbar.channel_access')}
              </Base>
            }
            subtitle={<></>}
            avatar={<HandIcon className="text-blue-500 w-6 h-6" />}
            suffix={
              <div className="flex flex-row items-center justify-center">
                <Info className="block mr-2">
                  {props.channel?.visibility === 'public' ? 'Public' : 'Private'}
                </Info>
                {canEdit ? <ChevronRightIcon className="w-5 h-5 text-zinc-500" /> : <> </>}
              </div>
            }
          />
          {!isGuest && !!props.onMembers && (
            <Block
              onClick={() => {
                props.onMembers && props.onMembers();
              }}
              className={
                '-mx-2 my-1 p-2 rounded-md ' +
                (canEdit ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800' : '')
              }
              title={
                <Base className="font-semibold">
                  {Languages.t('scenes.apps.parameters.workspace_sections.members')}
                </Base>
              }
              subtitle={<></>}
              avatar={<UsersIcon className="text-blue-500 w-6 h-6" />}
              suffix={<ChevronRightIcon className="w-5 h-5 text-zinc-500" />}
            />
          )}
        </>
      )}
      <Block
        onClick={() => {
          props.onMedias && props.onMedias();
        }}
        className="-mx-2 my-1 p-2 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800"
        title={
          <Base className="font-semibold">
            {Languages.t('components.channel_attachement_list.title')}
          </Base>
        }
        subtitle={<></>}
        avatar={<PhotographIcon className="text-blue-500 w-6 h-6" />}
        suffix={<ChevronRightIcon className="w-5 h-5 text-zinc-500" />}
      />
      <hr className="my-2 -mx-4" />

      <Block
        onClick={() => {
          const url = addUrlTryDesktop(
            `${document.location.origin}${RouterServices.generateRouteFromState({
              workspaceId: props.channel?.workspace_id || '',
              companyId: props.channel?.company_id,
              channelId: props.channel?.id,
            })}`,
          );
          copyToClipboard(url);
          ToasterService.success(Languages.t('components.input.copied'));
        }}
        className={
          '-mx-2 my-1 p-2 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800'
        }
        title={
          <Base className="font-semibold">
            {Languages.t('scenes.app.channelsbar.channel_copy_link')}
          </Base>
        }
        subtitle={<></>}
        avatar={<LinkIcon className="text-blue-500 w-6 h-6" />}
        suffix={<></>}
      />
      <FavoriteBlock channel={props.channel} />
      {!isDirect && (
        <NotificationsBlock
          channel={props.channel}
          onClick={() => {
            props.onNotifications && props.onNotifications();
          }}
        />
      )}

      {canLeave && <LeaveBlock channel={props.channel} onLeave={props.onClose} />}
      <div className="-mb-2" />
    </div>
  );
};

const RemoveBlock = (props: { channel?: ChannelType; onLeave?: Function }) => {
  const { refresh: refreshAllChannels } = useFavoriteChannels();
  const [loading, setLoading] = useState(false);

  return (
    <Block
      onClick={async () => {
        AlertManager.confirm(async () => {
          setLoading(true);
          await ChannelsMineAPIClient.removeChannel(
            props.channel?.company_id || '',
            props.channel?.workspace_id || '',
            props.channel?.id || '',
          );
          await refreshAllChannels();

          RouterServices.push(
            RouterServices.generateRouteFromState({
              companyId: props.channel?.company_id || '',
              workspaceId: props.channel?.workspace_id || '',
              channelId: '',
            }),
          );

          props.onLeave && props.onLeave();
        });
      }}
      className="-mx-2 my-1 p-2 rounded-md cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-800"
      title={
        <Base noColor className="font-semibold text-rose-500">
          {Languages.t('scenes.app.channelsbar.channel_removing')}
        </Base>
      }
      subtitle={<></>}
      avatar={
        loading ? (
          <Loader className="w-4 h-4 m-1" />
        ) : (
          <TrashIcon className="text-rose-500 w-6 h-6" />
        )
      }
    />
  );
};

const LeaveBlock = (props: { channel?: ChannelType; onLeave?: Function }) => {
  const { refresh: refreshAllChannels } = useFavoriteChannels();
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState(false);

  const leaveChannel = async (isDirectChannel = false) => {
    setLoading(true);
    if (props.channel?.id && props.channel?.company_id && props.channel.workspace_id) {
      const res = await ChannelsMineAPIClient.removeUser(user?.id || '', {
        companyId: props.channel.company_id,
        workspaceId: isDirectChannel ? 'direct' : props.channel.workspace_id,
        channelId: props.channel.id,
      });

      if (res?.error?.length && res?.message?.length) {
        ToasterService.error(`${res.error} - ${res.message}`);
      } else {
        await refreshAllChannels();

        RouterServices.push(
          RouterServices.generateRouteFromState({
            companyId: props.channel?.company_id || '',
            workspaceId: props.channel?.workspace_id || '',
            channelId: '',
          }),
        );

        props.onLeave && props.onLeave();
      }
      await refreshAllChannels();
    }

    setLoading(false);
  };

  return (
    <Block
      onClick={async () => {
        if (props.channel!.visibility) {
          if (isPrivateChannel(props.channel!.visibility)) {
            return AlertManager.confirm(() => leaveChannel(), undefined, {
              title: Languages.t('components.alert.leave_private_channel.title'),
              text: Languages.t('components.alert.leave_private_channel.description'),
            });
          }
          if (isDirectChannel(props.channel!.visibility)) {
            return leaveChannel(true);
          }
        }

        return leaveChannel();
      }}
      className="-mx-2 my-1 p-2 rounded-md cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-800"
      title={
        <Base noColor className="font-semibold text-rose-500">
          {Languages.t('scenes.app.channelsbar.channel_leaving')}
        </Base>
      }
      subtitle={<></>}
      avatar={
        loading ? (
          <Loader className="w-4 h-4 m-1" />
        ) : (
          <LogoutIcon className="text-rose-500 w-6 h-6" />
        )
      }
    />
  );
};

const NotificationsBlock = (props: { channel?: ChannelType; onClick: Function }) => {
  const { member } = useChannelMemberCurrentUser(props.channel?.id || '');

  return (
    <Block
      onClick={() => {
        props.onClick();
      }}
      className="-mx-2 my-1 p-2 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800"
      title={
        <Base className="font-semibold">
          {Languages.t('scenes.app.channelsbar.currentuser.user_parameter')}
        </Base>
      }
      subtitle={<></>}
      avatar={<BellIcon className="text-blue-500 w-6 h-6" />}
      suffix={
        <div className="flex flex-row items-center justify-center">
          <Info className="block mr-2">
            {member?.notification_level === 'all' &&
              Languages.t('scenes.apps.messages.left_bar.stream.notifications.all')}
            {member?.notification_level === 'mentions' && '@all, @[you]'}
            {member?.notification_level === 'me' &&
              Languages.t('scenes.apps.messages.left_bar.stream.notifications.me', [`@[you]`])}
            {member?.notification_level === 'none' &&
              Languages.t('scenes.apps.messages.left_bar.stream.notifications.never')}
          </Info>
          <ChevronRightIcon className="w-5 h-5 text-zinc-500" />
        </div>
      }
    />
  );
};

const FavoriteBlock = (props: { channel?: ChannelType }) => {
  const { favorite, setFavorite } = useChannelMemberCurrentUser(props.channel?.id || '');
  const [loading, setLoading] = useState(false);

  return (
    <Block
      onClick={async () => {
        setLoading(true);
        await setFavorite(!favorite);
        setLoading(false);
      }}
      className="-mx-2 my-1 p-2 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800"
      title={
        <Base className="font-semibold">
          {Languages.t(
            favorite
              ? 'scenes.apps.messages.left_bar.stream.remove_from_favorites'
              : 'scenes.apps.messages.left_bar.stream.add_to_favorites',
          )}
        </Base>
      }
      subtitle={<></>}
      avatar={
        loading ? (
          <Loader className="text-blue-500 w-4 h-4 m-1" />
        ) : favorite ? (
          <StarIconSolid className="text-yellow-500 w-6 h-6" />
        ) : (
          <StarIcon className="text-blue-500 w-6 h-6" />
        )
      }
    />
  );
};
