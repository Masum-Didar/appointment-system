import { getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Badge({ status, className = '' }) {
  return (
    <span className={`${getStatusColor(status)} ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
}
