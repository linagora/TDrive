export const Alert = (props: {
  theme: 'success' | 'danger' | 'warning' | 'gray' | 'primary';
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  className?: string;
  bullets?: string[];
  children?: React.ReactNode;
}) => {
  let color = 'blue';
  let textColor = 'white';
  if (props.theme === 'success') color = 'green-500';
  if (props.theme === 'danger') color = 'rose-500';
  if (props.theme === 'warning') color = 'orange-500';
  if (props.theme === 'gray') {
    color = 'zinc-50';
    textColor = 'zinc-900';
  }
  if (props.theme === 'primary') {
    color = 'blue-100';
    textColor = 'zinc-900';
  }

  return (
    <div
      className={
        `my-4 text-${textColor} bg-${color} p-4 flex items-center rounded-md ` +
        (props.className || '')
      }
    >
      <div className="flex items-center h-full" style={{ minHeight: 32 }}>
        <div className="flex-shrink-0">
          <props.icon className={`h-6 w-6`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium`}>{props.title}</h3>
          {(props.bullets || []).length > 0 && (
            <div className={`mt-2 text-sm text-${color}-800`}>
              <ul role="list" className="list-disc pl-5 space-y-1">
                {(props.bullets || []).map(bullet => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}
          {props.children}
        </div>
      </div>
    </div>
  );
};
