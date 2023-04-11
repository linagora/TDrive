import React from 'react';
import ObjectModal from '../object-modal/object-modal';
import Languages from 'app/features/global/services/languages-service';
import Emojione from '../emojione/emojione';
import { Button } from 'antd';

const NewVersionModal = () => {
  const onClickBtn = () => {
    return window.location.reload();
  };

  return (
    <ObjectModal
      title={
        <>
          {Languages.t('components.newversion.new_version_modal.title')} <Emojione type="rocket" />
        </>
      }
      footer={
        <Button type="primary" onClick={onClickBtn}>
          {Languages.t('scenes.app.header.disconnected.reload')}
        </Button>
      }
    >
      <div className="x-margin">
        <b>{Languages.t('components.newversion.new_version_component.row.part_1')}</b>,{' '}
        {Languages.t('components.newversion.new_version_component.row.part_2')}
      </div>
    </ObjectModal>
  );
};

export default NewVersionModal;
