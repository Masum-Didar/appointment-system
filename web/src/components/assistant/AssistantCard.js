import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function AssistantCard({ assistant }) {
  return (
    <Link href={`/assistants/${assistant.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600 text-xl font-bold shrink-0">
            {assistant.profile?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{assistant.profile?.name || assistant.phone}</h3>
            <p className="text-sm text-gray-500">Assistant</p>
            <p className="text-sm text-gray-400 mt-1">{assistant.phone}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
