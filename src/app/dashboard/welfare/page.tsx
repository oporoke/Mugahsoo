
import { WelfareTable } from '@/components/welfare-table';
import { getWelfareRequests, getMembers } from '@/lib/api';

export default async function WelfarePage() {
  const [allRequests, allMembers] = await Promise.all([
    getWelfareRequests(),
    getMembers(),
  ]);

  return <WelfareTable requests={allRequests} members={allMembers} />;
}
