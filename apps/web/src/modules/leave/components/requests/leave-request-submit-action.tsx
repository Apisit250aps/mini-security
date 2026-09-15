'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { FilePlus2 } from 'lucide-react';

interface LeaveRequestSubmitActionProps {
  companyId?: string;
}

export default function LeaveRequestSubmitAction({
  companyId: _companyId,
}: LeaveRequestSubmitActionProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/company/leave/requests/new');
  };

  return (
    <Button onPress={handleNavigate}>
      <FilePlus2 className="w-4 h-4 mr-1" />
      ยื่นคำขอลา
    </Button>
  );
}
