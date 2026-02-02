
import { MembersTable } from '@/components/members-table';
import { getMembers } from '@/lib/api';

export default async function MembersPage() {
  const allMembers = await getMembers();

  return <MembersTable members={allMembers} />;
}
