import { useRecoilState } from 'recoil';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import messageApiClient from 'app/features/messages/api/message-api-client';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import {
  channelAttachmentFileState,
  channelAttachmentListState,
  channelAttachmentMediaState,
} from '../state/channel-attachment-list';
import _ from 'lodash';

export const useChannelAttachmentList = (type: 'file' | 'media') => {
  const limit = 25;
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const channelId = useRouterChannel();
  const [loading, setLoading] = useRecoilState(
    LoadingState(`useChannelAttachmentList-${type}-${companyId}-${workspaceId}-${channelId}`),
  );
  const [isOpen] = useRecoilState(channelAttachmentListState);
  const [, setchannelFiles] = useRecoilState(channelAttachmentFileState(companyId));
  const [, setchannelMedia] = useRecoilState(channelAttachmentMediaState(companyId));

  const [result, setResult] = useRecoilState(
    type === 'media'
      ? channelAttachmentMediaState(companyId)
      : channelAttachmentFileState(companyId),
  );

  const options = _.omitBy(
    {
      limit,
      is_file: type === 'file' || undefined,
      is_media: type === 'media' || undefined,
      workspace_id: workspaceId,
      channel_id: channelId,
    },
    _.isUndefined,
  );

  const loadItems = async () => {
    setLoading(true);

    const response = await messageApiClient.searchFile(null, options);
    const results = (response.resources || []).sort(
      (a, b) => (b?.message?.created_at || 0) - (a?.message?.created_at || 0),
    );

    const update = {
      results,
      nextPage: response.next_page_token || null,
    };

    setResult(update);
    setLoading(false);
  };

  const loadMore = async () => {
    if (result.nextPage && result.results.length % limit === 0) {
      const response = await messageApiClient.searchFile(null, { ...options, next_page_token: result.nextPage });
      const results = (response.resources || []).sort(
        (a, b) => (b?.message?.created_at || 0) - (a?.message?.created_at || 0),
      );

      const update = {
        results: _.uniqBy([...result.results, ...results] || [], 'id'),
        nextPage: response.next_page_token || null,
      };

      setResult(update);
    }
  }

  const reset = () => {
    const update = {
      results: [],
      nextPage: null,
    }

    setchannelFiles(update);
    setchannelMedia(update);
  }

  useGlobalEffect(
    `useChannelAttachmentList${type}`,
    () => {
      if (!isOpen) {
        reset();
      }
    },
    [channelId, workspaceId, isOpen],
  );

  return {
    loading,
    result: result.results,
    loadItems,
    loadMore,
  };
};

export const useChannelMediaList = () => {
  return useChannelAttachmentList('media');
};

export const useChannelFileList = () => {
  return useChannelAttachmentList('file');
};
