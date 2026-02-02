
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { MembersTable } from '@/components/members-table';
import { getMembers } from '@/lib/api';

export default async function MembersPage() {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const members = await getMembers();

  return (
      <MembersTable members={members} />
  );
}
