
import { WelfareTable } from '@/components/welfare-table';
import { getWelfareRequests } from '@/lib/api';

export default async function WelfarePage() {
  const allRequests = await getWelfareRequests();

  return <WelfareTable requests={allRequests} />;
}
