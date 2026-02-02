
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { MembersTable } from '@/components/members-table';
import { getMembers } from '@/lib/api';

export default async function MembersPage({ searchParams }: { searchParams?: { query?: string } }) {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const query = searchParams?.query || '';
  const members = await getMembers({ query });

  return (
      <MembersTable members={members} />
  );
}
