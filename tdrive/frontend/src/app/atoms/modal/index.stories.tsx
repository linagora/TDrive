/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { RecoilRoot } from 'recoil';
import { ComponentStory } from '@storybook/react';
import { Modal, ModalContent } from '.';
import { Button } from '../button/button';
import { ButtonConfirm } from '../button/confirm';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { Title } from '../text';

export default {
  title: '@atoms/modal',
};

const Template: ComponentStory<any> = () => {
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);

  return (
    <RecoilRoot>
      <Modal open={openB} onClose={() => setOpenB(false)}>
        <Title>Title</Title>
        Hello this is the modal B<br />
        No more popup now
      </Modal>
      <Modal open={openA} onClose={() => setOpenA(false)}>
        <Title>Title</Title>
        Hello this is the modal A<br />
        <ButtonConfirm onClick={() => setOpenB(true)}>Open B</ButtonConfirm>
      </Modal>
      <Button onClick={() => setOpenA(true)}>Open A</Button>
    </RecoilRoot>
  );
};

export const Default = Template.bind({});
Default.args = {};

const TemplateWithContent: ComponentStory<any> = () => {
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);

  return (
    <RecoilRoot>
      <Modal open={openB} onClose={() => setOpenB(false)}>
        <ModalContent
          title="Modal B"
          text="Congratulation, this is modal B !"
          theme="success"
          icon={CheckCircleIcon}
          buttons={
            <>
              <Button
                className="ml-2"
                theme="default"
                onClick={() => {
                  setOpenB(false);
                }}
              >
                Go back on modal B
              </Button>
              <Button
                onClick={() => {
                  setOpenB(false);
                  setOpenA(false);
                }}
              >
                Close it all
              </Button>
            </>
          }
        />
      </Modal>
      <Modal open={openA} onClose={() => setOpenA(false)}>
        <ModalContent
          title="Modal A"
          text="This is the wrong popup, open the modal B !"
          theme="danger"
          icon={ExclamationCircleIcon}
          buttons={
            <>
              <ButtonConfirm onClick={() => setOpenB(true)}>Open modal B</ButtonConfirm>
            </>
          }
        />
      </Modal>
      <Button onClick={() => setOpenA(true)}>Open A</Button>
    </RecoilRoot>
  );
};

export const WithModalContent = TemplateWithContent.bind({});
WithModalContent.args = {};
