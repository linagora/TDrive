export const fadeZoomTransition = {
  enter: 'transform transition duration-[300ms]',
  enterFrom: 'opacity-0 scale-50',
  enterTo: 'opacity-100 scale-100',
  leave: 'transform duration-[300ms] transition ease-in-out',
  leaveFrom: 'opacity-100 scale-100 ',
  leaveTo: 'opacity-0 scale-95 ',
};

export const fadeTransition = {
  enter: 'transform transition duration-[300ms]',
  enterFrom: 'opacity-0',
  enterTo: 'opacity-100',
  leave: 'transform duration-[50ms] transition ease-in-out',
  leaveFrom: 'opacity-100 ',
  leaveTo: 'opacity-0 ',
};

export const slideXTransition = {
  enter: 'transform transition duration-[300ms]',
  enterFrom: 'opacity-0 translate-x-full',
  enterTo: 'opacity-100',
  leave: 'transform duration-[300ms] transition ease-in-out',
  leaveFrom: 'opacity-100 ',
  leaveTo: 'opacity-0 -translate-x-full',
};

export const slideXTransitionReverted = {
  enter: 'transform transition duration-[300ms]',
  enterFrom: 'opacity-0 -translate-x-full',
  enterTo: 'opacity-100',
  leave: 'transform duration-[300ms] transition ease-in-out',
  leaveFrom: 'opacity-100 ',
  leaveTo: 'opacity-0 translate-x-full',
};
