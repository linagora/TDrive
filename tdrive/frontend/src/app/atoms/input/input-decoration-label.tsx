import { Info } from '../text';

interface InputLabelProps {
  label?: string;
  feedback?: string;
  hasError?: boolean;
  input?: React.ReactNode;
  className?: string;
}

export const InputLabel = (props: InputLabelProps) => {
  return (
    <>
      {props.label && (
        <div className={props.className}>
          <label className="block text-sm text-zinc-400">{props.label}</label>
          <div className="mt-1">{props.input}</div>
          {props.feedback && (
            <Info noColor className={props.hasError ? 'text-rose-400' : 'text-blue-500'}>
              {props.feedback}
            </Info>
          )}
        </div>
      )}
    </>
  );
};
