export function compareTimeuuid(a?: string, b?: string): number {
  return timeuuidToDate(a || "") - timeuuidToDate(b || "");
}

export function timeuuidToDate(time_str: string): number {
  if (!time_str) {
    return 0;
  }

  const uuid_arr = time_str.split("-");
  const time_string = [uuid_arr[2].substring(1), uuid_arr[1], uuid_arr[0]].join("");

  return parseInt(time_string, 16);
}
