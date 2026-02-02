
import { ContributionsTable } from '@/components/contributions-table';
import { getContributions, getMemberByUserId } from '@/lib/api';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ContributionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userRole = session.user.role;
  let memberId: string | undefined;

  // Members only see their own contributions. Admins/Treasurers see all.
  if (userRole === 'MEMBER') {
    const member = await getMemberByUserId(session.user.id);
    if (!member) {
      return <p>Member details not found.</p>;
    }
    memberId = member.id;
  }
  
  const allContributions = await getContributions(undefined, memberId);

  return <ContributionsTable contributions={allContributions} />;
}
