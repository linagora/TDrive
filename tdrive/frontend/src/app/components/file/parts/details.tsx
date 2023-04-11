import React from 'react';
import { Tag, Typography } from 'antd';
import { capitalize } from 'lodash';

import Numbers from 'app/features/global/utils/Numbers';
import { DataFileType } from '../types';

type PropsType = {
  file: DataFileType;
  source: string;
};

const setRealFileSize = (file: DataFileType): string => Numbers.humanFileSize(file.size, true);

const setFileType = (file: DataFileType): string => capitalize(file.type.split('/')[0]);

const { Text } = Typography;
export const FileDetails = ({ file, source }: PropsType) => {
  let sourceTag: string | null = null;
  if (source === 'drive') {
    sourceTag = 'Drive';
  }

  return (
    <div className="file-component-details">
      <Text ellipsis style={{ verticalAlign: 'middle' }}>
        {file.name}
      </Text>
      <Text type="secondary" ellipsis style={{ verticalAlign: 'middle' }}>
        {!!sourceTag && <Tag color={'orange'}>{sourceTag}</Tag>}
        {setRealFileSize(file)} {setFileType(file)}
      </Text>
    </div>
  );
};

export default FileDetails;
