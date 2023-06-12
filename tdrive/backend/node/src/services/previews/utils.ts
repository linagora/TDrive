import mimes from "../../utils/mime";

export const TIMEOUT = 5 * 1000;
export const MAX_SIZE = 5 * 1024 * 1024;

export function isFileType(fileMime: string, fileName: string, requiredExtensions: string[]): any {
  const extension = fileName.split(".").pop();
  const secondaryExtensions = Object.keys(mimes).filter(k => mimes[k] === fileMime);
  const fileExtensions = [extension, ...secondaryExtensions];
  return fileExtensions.some(e => requiredExtensions.includes(e));
}
