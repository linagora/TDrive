/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import Archive from '../icons/archive.jsx';
import Code from '../icons/code.jsx';
import Document from '../icons/document.jsx';
import Files from '../icons/file.jsx';
import Images from '../icons/image.jsx';
import Link from '../icons/link.jsx';
import Pdf from '../icons/pdf.jsx';
import Slide from '../icons/slides.jsx';
import Sound from '../icons/sound.jsx';
import Spreadsheet from '../icons/spreadsheet.jsx';
import Svg from '../icons/svg.jsx';
import Video from '../icons/video.jsx';

export default class FileType extends Component {
  /* props : type (string) */
  constructor() {
    super();
  }
  render() {
    var type = this.props.type;
    var TypeIcon = Files;
    switch (type) {
      case 'link':
        TypeIcon = Link;
        break;
      case 'code':
        TypeIcon = Code;
        break;
      case 'document':
        TypeIcon = Document;
        break;
      case 'image':
        TypeIcon = Images;
        break;
      case 'pdf':
        TypeIcon = Pdf;
        break;
      case 'slides':
        TypeIcon = Slide;
        break;
      case 'audio':
        TypeIcon = Sound;
        break;
      case 'spreadsheet':
        TypeIcon = Spreadsheet;
        break;
      case 'svg':
        TypeIcon = Svg;
        break;
      case 'video':
        TypeIcon = Video;
        break;
      case 'archive':
        TypeIcon = Archive;
        break;
      default:
    }
    return <TypeIcon {...this.props} />;
  }
}
