import { Button } from 'app/atoms/button/button';
import { Input } from 'app/atoms/input/input-text';
import { Info } from 'app/atoms/text';
import { useDriveActions } from 'app/features/drive/hooks/use-drive-actions';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { CreateModalAtom } from '.';

export const CreateFolder = () => {
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useRecoilState(CreateModalAtom);
  const { create } = useDriveActions();

  return (
    <>
      <Info>Choose a name for the new folder.</Info>

      <Input
        disabled={loading}
        placeholder="Folder name"
        className="w-full mt-4"
        onChange={e => setName(e.target.value)}
      />

      <Button
        disabled={!name}
        loading={loading}
        className="mt-4 float-right"
        onClick={async () => {
          await create({ name, parent_id: state.parent_id, is_directory: true }, {});
          setState({ ...state, open: false });
        }}
      >
        Create
      </Button>
    </>
  );
};
