import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export default function WaitingList({ patients }) {
  if (!patients?.length) {
    return <p className="text-gray-500 text-sm">No patients waiting</p>;
  }

  return (
    <div className="space-y-2">
      {patients.map((p, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-400">#{p.serialNumber}</span>
            <div>
              <p className="font-medium">{p.patientName}</p>
              <p className="text-sm text-gray-500">{p.tokenNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge status={p.status} />
            <p className="text-sm text-gray-500 mt-1">~{p.estimatedWait} min</p>
          </div>
        </div>
      ))}
    </div>
  );
}
