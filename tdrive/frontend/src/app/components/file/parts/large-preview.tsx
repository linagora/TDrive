import React from 'react';
import { DataFileType } from '../types';
import { Play } from 'react-feather';

type PropsType = {
  file: DataFileType;
};

const LargePreview = ({ file: { thumbnail, type } }: PropsType): JSX.Element => {
  return (
    <div
      className="file-large-preview"
      style={{
        backgroundImage: `url(${thumbnail})`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {type === 'video' && (
        <div className='file-large-preview-play-container'>
          <Play
            size={32} 
            color={'white'}
            strokeWidth={3}
          />
        </div>
      )}
    </div>
  );
};

export default LargePreview;
