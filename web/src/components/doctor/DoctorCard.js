import Link from 'next/link';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

export default function DoctorCard({ doctor }) {
  return (
    <Link href={`/doctors/${doctor.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xl font-bold shrink-0">
            {doctor.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{doctor.name}</h3>
            <p className="text-sm text-primary-600">{doctor.speciality}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span>⭐ {doctor.rating || '0.0'}</span>
              <span>{doctor.experienceYears || 0}yrs exp</span>
              <span className="font-medium text-gray-900">{formatCurrency(doctor.consultationFee)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
