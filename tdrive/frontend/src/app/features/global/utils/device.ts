export function getDevice() {
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return 'ios';
  }
  if (/Android/i.test(navigator.userAgent)) {
    return 'android';
  }
  return 'other';
}
