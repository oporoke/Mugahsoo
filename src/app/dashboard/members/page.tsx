
import { MembersTable } from '@/components/members-table';
import { getMembers } from '@/lib/api';

export default async function MembersPage({ searchParams }: { searchParams?: { query?: string } }) {
  const query = searchParams?.query || '';
  const allMembers = await getMembers(query);

  return <MembersTable members={allMembers} />;
}
