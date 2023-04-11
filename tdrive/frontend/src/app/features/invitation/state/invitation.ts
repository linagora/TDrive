import { ChannelType } from 'app/features/channels/types/channel';
import { atom } from 'recoil';

export enum InvitationType {
  guest = "guest",
  member = "member",
}

export type InvitedUser = {
  email: string,
  role: InvitationType
}

export const invitationState = atom<boolean>({
  default: false,
  key: 'invitationState',
});

export const invitationActiveTab = atom<number>({
  default: 0,
  key: 'invitationActiveTabState',
});

export const invitationTypeState = atom<InvitationType>({
  default: InvitationType.member,
  key: 'invitationTypeState',
});

export const invitationEmailsState = atom<InvitedUser[]>({
  default: [],
  key: 'invitationEmailsState',
});

export const invitationChannelSelectionState = atom<boolean>({
  default: false,
  key: 'invitationChannelSelectionState',
});

export const invitationChannelListState = atom<ChannelType[]>({
  default: [],
  key: 'invitationChannelListState',
});

export const invitationSentState = atom<boolean>({
  default: false,
  key: 'invitationSentState',
});
