import Badge from '@/components/ui/Badge';
import { getStatusColor } from '@/lib/utils';

export default function AppointmentStatus({ status }) {
  return <Badge status={status} />;
}
