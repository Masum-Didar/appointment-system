import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to HealthQueue
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Bangladesh&apos;s premier healthcare appointment and queue management system.
          Book appointments, track live queues, and manage your healthcare journey.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="text-center p-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">Find Doctors</h3>
          <p className="text-gray-500 text-sm mb-4">
            Search by speciality, location, or name. Read reviews and check availability.
          </p>
          <Link href="/doctors" className="text-primary-600 hover:underline font-medium">
            Search Doctors &rarr;
          </Link>
        </Card>

        <Card className="text-center p-8">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold mb-2">Book Appointments</h3>
          <p className="text-gray-500 text-sm mb-4">
            Schedule appointments with verified doctors at your preferred chamber.
          </p>
          <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">
            Book Now &rarr;
          </Link>
        </Card>

        <Card className="text-center p-8">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold mb-2">Live Queue</h3>
          <p className="text-gray-500 text-sm mb-4">
            Track real-time queue status, estimated wait time, and your position.
          </p>
          <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">
            View Queue &rarr;
          </Link>
        </Card>
      </div>
    </div>
  );
}
