// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export default (a: any, b: any): any => {
  if (a === undefined) {
    return b;
  }
  return a;
};
