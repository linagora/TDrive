/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import classNames from 'classnames';
import { Divider, Layout, Typography, Col, Row } from 'antd';

import ModalManager from 'app/components/modal/modal-manager';
import Icon from 'app/components/icon/icon.jsx';

import './object-modal.scss';

type PropsType = {
  title?: string | JSX.Element;
  closable?: boolean;
  children?: React.Component | JSX.Element | any;
  footer?: React.Component | JSX.Element | any;
  hideFooterDivider?: boolean;
  footerAlign?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | undefined;
  titleCenter?: boolean;
  style?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
  titleLevel?: 5 | 1 | 2 | 3 | 4 | undefined;
  titleColor?: string;
  colTitleStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  titleTypographyStyle?: React.CSSProperties;
  className?: string;
  footerDividerStyle?: React.CSSProperties;
  onClose?: () => void;
};

const { Header, Content, Footer } = Layout;
const ObjectModal: FC<PropsType> = (props: PropsType) => {
  return (
    <Layout
      className={classNames('modal-layout', props.className)}
      hasSider={false}
      style={props.style || {}}
    >
      <Header className="modal-layout-header" style={props.headerStyle || {}}>
        <Row justify="space-between" align="middle" className="modal-layout-row" wrap={false}>
          {props.titleCenter && <Col style={{ width: 32 }}></Col>}
          {props.title && (
            <Col style={props.colTitleStyle}>
              <Typography.Title
                level={props.titleLevel || 5}
                style={{
                  margin: 0,
                  marginTop: props.titleCenter ? 8 : 0,
                  color: props.titleColor,
                  ...props.titleTypographyStyle,
                }}
              >
                {props.title}
              </Typography.Title>
            </Col>
          )}
          {(props.closable === true && (
            <Col>
              <Icon
                type="times"
                className={`m-icon-small square-button ${
                  props.headerStyle?.backgroundColor ? 'red' : ''
                }`}
                onClick={() => (props?.onClose ? props.onClose() : ModalManager.closeAll())}
              />
            </Col>
          )) || <Col style={{ width: 32 }}></Col>}
        </Row>
      </Header>
      {props.children && <Content style={props.contentStyle}>{props.children}</Content>}
      {props.footer && (
        <Footer className="modal-layout-footer">
          {!props.hideFooterDivider && (
            <Divider className="y-margin" style={props.footerDividerStyle} />
          )}
          <Row align="middle" justify={props.footerAlign || 'end'}>
            <Col
              style={{
                marginBottom: props.footerAlign === 'center' ? 54 : 16,
                marginRight: !props.footerAlign ? 16 : 0,
                ...props.footerStyle,
              }}
            >
              {props.footer}
            </Col>
          </Row>
        </Footer>
      )}
    </Layout>
  );
};

export default ObjectModal;
