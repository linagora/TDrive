/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import UploadManager from './upload-manager';
import Languages from 'app/features/global/services/languages-service';
import { Upload } from 'react-feather';
import classNames from 'classnames';
import './uploads.scss';
import { Typography } from 'antd';

type PropsType = {
  [key: string]: any;
  onAddFiles: (files: File[], event: Event & { dataTransfer: DataTransfer }) => void;
};

type StateType = { [key: string]: any };

type FileInputType = any;

type FileObjectType = { [key: string]: any };

let sharedFileInput: any = null;
let sharedFolderInput: any = null;

export default class UploadZone extends React.Component<PropsType, StateType> {
  file_input: FileInputType = {};
  stopHoverTimeout: ReturnType<typeof setTimeout> | undefined;
  node: HTMLDivElement | null = null;

  constructor(props: PropsType) {
    super(props);
    this.state = {
      upload_manager: UploadManager,
    };
    UploadManager.addListener(this);
  }

  componentWillUnmount() {
    UploadManager.removeListener(this);
  }

  componentDidMount() {
    this.node && this.watch(this.node, document.body);

    if (
      (this.props.directory && !sharedFolderInput) ||
      (!this.props.directory && !sharedFileInput)
    ) {
      this.file_input = document.createElement('input');
      this.file_input.type = 'file';
      this.file_input.style.position = 'absolute';
      this.file_input.style.top = '-10000px';
      this.file_input.style.left = '-10000px';
      this.file_input.style.width = '100px';
      this.file_input.multiple = this.props.multiple ? true : false;
      this.file_input.directory = this.props.directory ? true : false;
      this.file_input.webkitdirectory = this.props.directory ? true : false;

      this.setCallback();

      document.body.appendChild(this.file_input);

      if (this.props.directory) {
        sharedFolderInput = this.file_input;
      } else {
        sharedFileInput = this.file_input;
      }
    } else {
      this.file_input = sharedFileInput;
    }
  }

  setCallback() {
    this.file_input.onchange = (e: any) => {
      this.change(e);
    };
  }

  open() {
    if (this.props.disabled) {
      return;
    }

    this.setCallback();

    this.file_input.click();
  }

  /**
   *
   * @param tree
   * @param nb
   * @param totalSize
   */
  upload(tree: any, nb?: number, totalSize?: number) {
    if (this.props.multiple === false) {
      nb = 1;
      let file: any = null;
      Object.keys(tree).every(i => {
        const element = tree[i];
        if (element.size) {
          file = {};
          file[i] = element;
          totalSize = element.size;
          return false;
        }
        return true;
      });
      if (!file) {
        return;
      }
    }
    UploadManager.startUpload(
      tree,
      nb,
      totalSize,
      this.props.parent,
      this.props.uploadOptions,
      this.props.driveCollectionKey,
      this.props.onUploaded,
    );
  }

  /**
   *
   * @param event
   */
  change(event: any) {
    if (this.props.disabled) return;
    event.preventDefault();
    this.hover(false);

    const files = event.target.files || event.dataTransfer.files || [];
    if (this.props.onAddFiles && files.length > 0) return this.props.onAddFiles([...files], event);
  }

  /**
   *
   * @param currentNode
   * @param body
   */
  watch(currentNode: HTMLElement, body: HTMLElement) {
    /**
     * DRAGOVER EVENT
     */
    currentNode.addEventListener('dragover', () => currentNode.classList.add('input-drag-focus'));

    body.addEventListener('dragover', (e: DragEvent) => {
      body.classList.add('body-drag-focus');
      this.hover(true, e);

      e.preventDefault();
    });

    /**
     * DRAGLEAVE EVENT
     */
    currentNode.addEventListener('dragleave', () =>
      currentNode.classList.remove('input-drag-focus'),
    );

    body.addEventListener('dragleave', (e: DragEvent) => {
      body.classList.remove('body-drag-focus');

      if (this.props.onDragLeave) {
        this.props.onDragLeave();
      }

      this.hover(false, e);

      e.preventDefault();
    });

    /**
     * DROP EVENT
     */

    currentNode.addEventListener('drop', (e: DragEvent) => {
      currentNode.classList.contains('input-drag-focus') && this.change(e);

      e.preventDefault();
    });

    body.addEventListener('drop', (e: DragEvent) => {
      this.hover(false, e);
      e.preventDefault();
    });

    /**
     * DRAGENTER EVENT
     */
    body.addEventListener('dragenter', (e: DragEvent) => {
      if (!this.props.disabled && this.props.onDragEnter) {
        this.props.onDragEnter();
      }

      this.hover(true, e);
      e.preventDefault();

      this.setCallback();
    });
  }

  /**
   * @param {Blob[]} files
   * @returns
   */
  uploadFiles(files: any = []) {
    if (!this.props.allowPaste || !files.length) {
      return;
    }

    const filesToUpload: any = {};

    files.forEach((file: FileObjectType, index: number) => {
      const filename = file.name
        ? file.name.replace(/\.(png|jpeg|jpg|tiff|gif)$/i, '')
        : `file-${index}`;
      filesToUpload[filename] = file;
    });

    this.upload(filesToUpload);
  }

  /**
   *
   * @param state
   * @param event
   */
  hover(state: any, event?: any) {
    if (
      !this.state.dragover &&
      (!event || !event.dataTransfer || (event.dataTransfer.types || []).indexOf('Files') < 0)
    ) {
      return;
    }
    if (!state) {
      this.stopHoverTimeout = setTimeout(() => {
        this.setState({ dragover: false });
      }, 200);
      return;
    }
    if (this.stopHoverTimeout) clearTimeout(this.stopHoverTimeout);
    if (this.state.dragover !== state) {
      this.setState({ dragover: state });
    }
  }

  render() {
    return (
      <div
        ref={node => node && (this.node = node)}
        style={this.props.style}
        className={classNames('upload_drop_zone', this.props.className)}
        onClick={() => {
          if (!this.props.disableClick) {
            this.open();
          }
        }}
      >
        {!this.props.disabled && (
          <div
            className={classNames('on_drag_over_background', {
              dragover: this.state.dragover,
            })}
          >
            <div className={'dashed ' + this.props.overClassName}>
              <div
                className={classNames('centered', { skew_in_top_nobounce: !!this.state.dragover })}
              >
                <div className="subtitle">
                  <Upload size={18} className="small-right-margin" />
                  <Typography.Text strong style={{ color: 'var(--primary)' }}>
                    {Languages.t('components.upload.drop_files')}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </div>
        )}

        {this.props.children}
      </div>
    );
  }
}
