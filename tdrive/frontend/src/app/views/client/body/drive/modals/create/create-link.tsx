import { Button } from 'app/atoms/button/button';
import { Input } from 'app/atoms/input/input-text';
import { Info } from 'app/atoms/text';
import { useDriveActions } from 'app/features/drive/hooks/use-drive-actions';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { CreateModalAtom } from '.';
import FileUploadService from 'features/files/services/file-upload-service';

export const CreateLink = () => {
  const [name, setName] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [loading] = useState<boolean>(false);
  const [state, setState] = useRecoilState(CreateModalAtom);
  const { create } = useDriveActions();

  const createLink = async () => {
    let finalLink = link.trim();
    if (!/^https?:\/\//i.test(finalLink)) finalLink = 'http://' + finalLink;
    const file = new File(['[InternetShortcut]\nURL=' + finalLink], name?.trim() + '.url', {
      type: 'text/uri-list',
    });

    await FileUploadService.upload([file], {
      context: {
        parentId: state.parent_id,
      },
      callback: (file, context) => {
        if (file)
          create(
            { name, parent_id: context.parentId, size: file.upload_data?.size },
            {
              provider: 'internal',
              application_id: '',
              file_metadata: {
                name: file.metadata?.name,
                size: file.upload_data?.size,
                mime: file.metadata?.mime,
                thumbnails: file?.thumbnails,
                source: 'internal',
                external_id: file.id,
              },
            },
          );
      },
    });
  };

  return (
    <>
      <Info>Create a link</Info>

      <Input
        disabled={loading}
        placeholder="Link name"
        className="w-full mt-4"
        onChange={e => setName(e.target.value)}
      />

      <Input
        disabled={loading}
        placeholder="https://example.com"
        className="w-full mt-4"
        onChange={e => setLink(e.target.value)}
      />

      <Button
        disabled={!name || !link}
        loading={loading}
        className="mt-4 float-right"
        onClick={async () => {
          await createLink();
          setState({ ...state, open: false });
        }}
      >
        Create link
      </Button>
    </>
  );
};
