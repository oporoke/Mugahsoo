import { WelfareTable } from '@/components/welfare-table';
import { welfareRequests } from '@/lib/data';

export default function WelfarePage() {
  // In a real app, you'd fetch data from an API
  const allRequests = welfareRequests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  return <WelfareTable requests={allRequests} />;
}
