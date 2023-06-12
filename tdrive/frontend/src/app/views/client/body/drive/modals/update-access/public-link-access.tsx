import A from '@atoms/link';
import { Base, Info, Subtitle } from '@atoms/text';
import { useDriveItem, getPublicLink } from '@features/drive/hooks/use-drive-item';
import { ToasterService } from '@features/global/services/toaster-service';
import { copyToClipboard } from '@features/global/utils/CopyClipboard';
import { Checkbox } from 'app/atoms/input/input-checkbox';
import { Input } from 'app/atoms/input/input-text';
import { useEffect, useState } from 'react';
import { AccessLevel } from './common';
import moment from 'moment';

export const PublicLinkManager = ({ id, disabled }: { id: string; disabled?: boolean }) => {
  const { item, loading, update } = useDriveItem(id);
  const publicLink = getPublicLink(item);
  return (
    <>
      <Base className="block mt-2 mb-1">Public link access</Base>
      <div className="p-4 rounded-md border">
        <div className="flex flex-row overflow-hidden w-full">
          <div className="grow">
            {item?.access_info?.public?.level !== 'none' && (
              <Info>Anyone with this link will have access to this item.</Info>
            )}
            {item?.access_info?.public?.level === 'none' && (
              <Info>This item is not available by public link.</Info>
            )}
            {item?.access_info?.public?.level !== 'none' && (
              <>
                <br />
                <A
                  className="inline-block"
                  onClick={() => {
                    copyToClipboard(publicLink);
                    ToasterService.success('Public link copied to clipboard');
                  }}
                >
                  Copy public link to clip board
                </A>
              </>
            )}
          </div>
          <div className="shrink-0">
            <AccessLevel
              hiddenLevels={['manage']}
              disabled={loading || disabled}
              level={item?.access_info?.public?.level || null}
              onChange={level => {
                update({
                  access_info: {
                    entities: item?.access_info.entities || [],
                    public: { ...(item?.access_info?.public || { token: '' }), level },
                  },
                });
              }}
            />
          </div>
        </div>
        {item?.access_info?.public?.level !== 'none' && (
          <PublicLinkOptions
            disabled={loading || disabled}
            password={item?.access_info?.public?.password}
            expiration={item?.access_info?.public?.expiration}
            onChangePassword={(password: string) => {
              update({
                access_info: {
                  entities: item?.access_info.entities || [],
                  public: {
                    ...item!.access_info!.public!,
                    password: password || '',
                  },
                },
              });
            }}
            onChangeExpiration={(expiration: number) => {
              update({
                access_info: {
                  entities: item?.access_info.entities || [],
                  public: {
                    ...item!.access_info!.public!,
                    expiration: expiration || 0,
                  },
                },
              });
            }}
          />
        )}
      </div>{' '}
    </>
  );
};

const PublicLinkOptions = (props: {
  disabled?: boolean;
  password?: string;
  expiration?: number;
  onChangePassword: Function;
  onChangeExpiration: Function;
}) => {
  const [usePassword, setUsePassword] = useState(!!props.password);
  const [password, setPassword] = useState(props.password);
  const [useExpiration, setUseExpiration] = useState((props.expiration || 0) > 0);
  const [expiration, setExpiration] = useState(props.expiration);

  useEffect(() => {
    props.onChangePassword(usePassword ? password : '');
  }, [usePassword, password]);

  useEffect(() => {
    props.onChangeExpiration(useExpiration ? expiration : 0);
  }, [useExpiration, expiration]);

  return (
    <>
      <Subtitle className="block mt-4 mb-1">Public link security</Subtitle>
      <div className="flex items-center justify-center w-full h-10">
        <Checkbox
          disabled={props.disabled}
          onChange={s => {
            setUsePassword(s);
            if (!password && s) setPassword(Math.random().toString(36).slice(-8));
          }}
          value={!!usePassword}
          label="Password"
        />
        <div className="grow mr-2" />
        {!!usePassword && (
          <Input
            disabled={props.disabled}
            className="max-w-xs"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onClick={() => {
              if (password) copyToClipboard(password);
              ToasterService.success('Password copied to clipboard');
            }}
          />
        )}
      </div>
      <div className="flex items-center justify-center w-full h-10">
        <Checkbox
          disabled={props.disabled}
          onChange={s => {
            setUseExpiration(s);
            if (!expiration && s) setExpiration(Date.now() + 1000 * 60 * 60 * 24 * 7);
          }}
          value={!!useExpiration}
          label="Expiration"
        />
        {useExpiration && (expiration || 0) < Date.now() && (
          <Info className="ml-2 text-red-500">(Expired)</Info>
        )}
        {useExpiration && (expiration || 0) > Date.now() && (
          <Info className="ml-2">({moment(expiration).fromNow(true)})</Info>
        )}{' '}
        <div className="grow mr-2" />
        {!!useExpiration && (
          <Input
            disabled={props.disabled}
            type="date"
            className="max-w-xs"
            value={new Date(expiration || 0).toISOString().split('T')[0]}
            onChange={e => {
              e.target.value && setExpiration(new Date(e.target.value).getTime());
            }}
          />
        )}
      </div>
    </>
  );
};
