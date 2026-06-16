import Card from '@/components/ui/Card';
import { getDayName, formatTime } from '@/lib/utils';

export default function ScheduleView({ schedules }) {
  if (!schedules?.length) {
    return <p className="text-gray-500 text-sm">No schedules available</p>;
  }

  return (
    <div className="space-y-3">
      {schedules.map((s) => (
        <Card key={s.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{getDayName(s.dayOfWeek)}</p>
              <p className="text-sm text-gray-500">
                {formatTime(s.startTime)} - {formatTime(s.endTime)}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-500">Max: {s.maxPatients} patients</p>
              <p className="text-gray-500">Every {s.slotDuration} min</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
