import DoctorCard from './DoctorCard';
import Spinner from '@/components/ui/Spinner';

export default function DoctorList({ doctors, loading }) {
  if (loading) return <Spinner className="py-12" />;

  if (!doctors?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No doctors found. Try different search criteria.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}
