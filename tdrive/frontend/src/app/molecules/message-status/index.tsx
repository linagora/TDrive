import { MessageDeliveryStatusType } from 'app/features/messages/types/message';
import { StatusCheckDoubleIcon, StatusCheckIcon } from 'app/atoms/icons-agnostic';

type PropsType = {
  status: MessageDeliveryStatusType | null | undefined;
};

export default ({ status }: PropsType) => {
  const messageStatus = status ?? 'read';

  return (
    <div className="message-delivery-status float-right -mt-4">
      {messageStatus === 'sent' && <StatusCheckIcon className="text-zinc-400" />}
      {messageStatus === 'delivered' && <StatusCheckDoubleIcon className="text-zinc-400" />}
      {messageStatus === 'read' && <StatusCheckDoubleIcon className="text-blue-500" />}
    </div>
  );
};
