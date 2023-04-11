/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useRef } from 'react';
import HiddenNotificationService from 'components/scroll-hidden-components/hidden-notification-service';
import animateScrollTo from 'animated-scroll-to';

import './notifications.scss';

type PropsType = {
  children: JSX.Element | any;
  scrollTopComponent?: JSX.Element;
  scrollBottomComponent?: JSX.Element;
  tag: string;
  disabled?: boolean;
};

const ScrollWithHiddenComponents: FC<PropsType> = ({
  children,
  scrollTopComponent,
  scrollBottomComponent,
  tag,
  disabled,
}) => {
  const ref = useRef<any>(null);
  const service = HiddenNotificationService.get(tag);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (disabled) {
      return;
    }
    service.setScroller(ref.current.firstChild);
    return () => service.removeScroller();
  }, [tag, ref, disabled]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const beacon: number[] = service.useWatcher(() => [
    service.state.beaconTop.length,
    service.state.beaconBottom.length,
  ]);

  const alignCenter = (node: any) =>
    node.current.offsetTop - (service.scroller.node.clientHeight + node.current.clientHeight) / 2;

  const optionsScroller = {
    elementToScroll: service.scroller.node,
  };

  const previousBeacon = () => {
    const previousNode = service.state.beaconTop.sort((a: any, b: any) => b.top - a.top)?.[0]?.node;
    if (previousNode) return animateScrollTo(alignCenter(previousNode), optionsScroller);
  };

  const nextBeacon = () => {
    const nextNode = service.state.beaconBottom.sort((a: any, b: any) => a.top - b.top)?.[0]?.node;
    if (nextNode) return animateScrollTo(alignCenter(nextNode), optionsScroller);
  };

  const hideScrollComponent = (beaconLength: number): string => (beaconLength > 0 ? '' : 'hide');

  return (
    <>
      <div ref={ref} className="scroll-children-component">
        {children}
        <div
          className={`scroll-top-component ${hideScrollComponent(beacon[0])}`}
          onClick={previousBeacon}
        >
          {scrollTopComponent}
        </div>
        <div
          className={`scroll-bottom-component ${hideScrollComponent(beacon[1])}`}
          onClick={nextBeacon}
        >
          {scrollBottomComponent}
        </div>
      </div>
    </>
  );
};

export default ScrollWithHiddenComponents;
