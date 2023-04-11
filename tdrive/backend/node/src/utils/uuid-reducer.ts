export const reduceUUID4 = function (id: string): string {
  if (!id) return undefined;

  return id
    .replace(/(.)\1{2,3}/g, "$1i")
    .replace(/(.)\1{1,2}/g, "$1h")
    .replace(/-/g, "g");
};

export const expandUUID4 = function (id: string): string {
  if (!id) return undefined;

  return (
    id
      .replace(/(.)i/g, "$1$1$1")
      .replace(/(.)h/g, "$1$1")
      .replace(/[^0-9a-g]/g, "")
      .replace(/g/g, "-") || undefined
  );
};
