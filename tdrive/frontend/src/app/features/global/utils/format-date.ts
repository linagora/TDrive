export const formatDate = (date?: number) => {
  return date
    ? new Intl.DateTimeFormat(navigator.languages[0], {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'short',
        hour12: false,
      }).format(new Date(date))
    : '';
};
