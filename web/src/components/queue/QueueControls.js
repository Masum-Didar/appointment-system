'use client';

import Button from '@/components/ui/Button';
import api from '@/lib/api';

export default function QueueControls({ chamberId, onUpdate }) {
  const handleAction = async (action) => {
    try {
      await api[action](chamberId);
      if (onUpdate) onUpdate();
    } catch {
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={() => handleAction('callNextPatient')} className="text-sm">
        Call Next
      </Button>
      <Button variant="secondary" onClick={() => handleAction('pauseQueue')} className="text-sm">
        Pause
      </Button>
      <Button variant="secondary" onClick={() => handleAction('resumeQueue')} className="text-sm">
        Resume
      </Button>
      <Button variant="danger" onClick={() => handleAction('resetQueue')} className="text-sm">
        Reset
      </Button>
    </div>
  );
}
