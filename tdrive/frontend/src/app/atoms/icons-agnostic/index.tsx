import React, { ComponentProps } from 'react';

import { ReactComponent as CopySvg } from './assets/copy.svg';
import { ReactComponent as DeleteSvg } from './assets/delete.svg';
import { ReactComponent as DownloadSvg } from './assets/download.svg';
import { ReactComponent as UploadSvg } from './assets/upload.svg';
import { ReactComponent as InputClearSvg } from './assets/input-clear.svg';
import { ReactComponent as ShareSvg } from './assets/share.svg';
import { ReactComponent as EyeSvg } from './assets/eye.svg';
import { ReactComponent as UserAddSvg } from './assets/user-add.svg';
import { ReactComponent as CheckSvg } from './assets/check.svg';
import { ReactComponent as CheckOutlineSvg } from './assets/check-outline.svg';
import { ReactComponent as ZommInSvg } from './assets/zoom-in.svg';
import { ReactComponent as ZoomOutSvg } from './assets/zoom-out.svg';
import { ReactComponent as VerticalDotsSvg } from './assets/vertical-dots.svg';
import { ReactComponent as RotateCwSvg } from './assets/rotate-cw.svg';
import { ReactComponent as Plus } from './assets/plus.svg';
import { ReactComponent as Up } from './assets/up.svg';
import { ReactComponent as X } from './assets/x.svg';
import { ReactComponent as StatusCheckDouble } from './assets/status-check-double.svg';
import { ReactComponent as StatusCheck } from './assets/status-check.svg';
import { ReactComponent as Users } from './assets/users.svg';

export const CopyIcon = (props: ComponentProps<'svg'>) => <CopySvg {...props} />;
export const DeleteIcon = (props: ComponentProps<'svg'>) => <DeleteSvg {...props} />;
export const DownloadIcon = (props: ComponentProps<'svg'>) => <DownloadSvg {...props} />;
export const EyeIcon = (props: ComponentProps<'svg'>) => <EyeSvg {...props} />;
export const InputClearIcon = (props: ComponentProps<'svg'>) => <InputClearSvg {...props} />;
export const ShareIcon = (props: ComponentProps<'svg'>) => <ShareSvg {...props} />;
export const UserAddIcon = (props: ComponentProps<'svg'>) => <UserAddSvg {...props} />;
export const CheckIcon = (props: ComponentProps<'svg'>) => <CheckSvg {...props} />;
export const CheckOutlineIcon = (props: ComponentProps<'svg'>) => <CheckOutlineSvg {...props} />;
export const ZoomInIcon = (props: ComponentProps<'svg'>) => <ZommInSvg {...props} />;
export const ZoomOutIcon = (props: ComponentProps<'svg'>) => <ZoomOutSvg {...props} />;
export const VerticalDotsIcon = (props: ComponentProps<'svg'>) => <VerticalDotsSvg {...props} />;
export const RotateCwIcon = (props: ComponentProps<'svg'>) => <RotateCwSvg {...props} />;
export const UploadCwIcon = (props: ComponentProps<'svg'>) => <UploadSvg {...props} />;
export const PlusIcon = (props: ComponentProps<'svg'>) => <Plus {...props} />;
export const UpIcon = (props: ComponentProps<'svg'>) => <Up {...props} />;
export const XIcon = (props: ComponentProps<'svg'>) => <X {...props} />;
export const StatusCheckDoubleIcon = (props: ComponentProps<'svg'>) => (
  <StatusCheckDouble {...props} />
);
export const StatusCheckIcon = (props: ComponentProps<'svg'>) => <StatusCheck {...props} />;
export const UsersIcon = (props: ComponentProps<'svg'>) => <Users {...props} />;
