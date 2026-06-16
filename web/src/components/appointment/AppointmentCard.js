import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AppointmentCard({ appointment }) {
  return (
    <Link href={`/appointments/${appointment.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <Badge status={appointment.status} />
          <span className="text-sm font-mono text-gray-500">{appointment.tokenNumber}</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold shrink-0">
            {appointment.doctor?.name?.charAt(0) || 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{appointment.doctor?.name || 'Doctor'}</p>
            <p className="text-sm text-gray-500">
              {appointment.chamber?.name} - {appointment.chamber?.city}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(appointment.appointmentDate)} | Serial: {appointment.serialNumber}
            </p>
            <p className="text-sm font-medium mt-1">{formatCurrency(appointment.consultationFee)}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
