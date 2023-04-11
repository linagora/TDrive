import React, { useState } from 'react';
import { Tag } from 'antd';

import { ApplicationScopes } from 'app/features/applications/types/application';
import { defaultApplicationScopes } from '../default-scopes';

export const TagPicker = ({
  defaulActiveTags,
  onChange,
}: {
  defaulActiveTags: ApplicationScopes[];
  onChange: (tags: ApplicationScopes[]) => void;
}) => {
  const [activeTags, setActiveTags] = useState<ApplicationScopes[]>(defaulActiveTags);

  const handleOnClickTag = (scope: ApplicationScopes) => {
    if (activeTags.includes(scope)) {
      setActiveTags(activeTags.filter(s => s !== scope));
      onChange(activeTags.filter(s => s !== scope));
    }

    if (!activeTags.includes(scope)) {
      setActiveTags([...activeTags, scope]);
      onChange([...activeTags, scope]);
    }
  };

  return (
    <>
      {defaultApplicationScopes.map(scope => {
        return (
          <Tag
            key={scope}
            color={activeTags.includes(scope) ? 'var(--success)' : 'var(--grey-dark)'}
            onClick={() => handleOnClickTag(scope)}
            style={{ cursor: 'pointer' }}
          >
            {scope}
          </Tag>
        );
      })}
    </>
  );
};
