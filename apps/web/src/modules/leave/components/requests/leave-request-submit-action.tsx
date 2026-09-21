'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { FilePlus2 } from 'lucide-react';

interface LeaveRequestSubmitActionProps {
  organizationId?: string;
}

export default function LeaveRequestSubmitAction({
  organizationId: _organizationId,
}: LeaveRequestSubmitActionProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/organization/leave/requests/new');
  };

  return (
    <Button onPress={handleNavigate}>
      <FilePlus2 className="w-4 h-4 mr-1" />
      ยื่นคำขอลา
    </Button>
  );
}
