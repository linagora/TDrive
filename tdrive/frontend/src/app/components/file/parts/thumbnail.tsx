import React from 'react';
import classNames from 'classnames';
import { FileText, Film, Headphones, Archive, Link, Image } from 'react-feather';
import { DataFileType } from '../types';

type PropsType = {
  file: DataFileType;
};

export const FileThumbnail = ({ file }: PropsType): JSX.Element => {
  const type = file.type;
  const canHavePreview = ['image', 'video', 'pdf', 'document', 'slides', 'spreadsheet'].includes(
    type,
  );

  return (
    <div className={classNames('file-thumbnail-container', 'small-right-margin')}>
      {canHavePreview && file.thumbnail && (
        <div
          className="ant-image file-thumbnail-component"
          style={{
            width: 32,
            height: 32,
            backgroundImage: `url(${file.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {type === 'image' && !file.thumbnail && <Image size={20} />}
      {type === 'video' && !file.thumbnail && <Film size={20} />}
      {['pdf', 'document', 'slides', 'spreadsheet', 'other'].includes(type) && !file.thumbnail && (
        <FileText size={20} />
      )}
      {type === 'audio' && <Headphones size={20} />}
      {type === 'archive' && <Archive size={20} />}
      {type === 'link' && <Link size={20} />}
    </div>
  );
};

export default FileThumbnail;
