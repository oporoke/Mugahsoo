
import { ContributionsTable } from '@/components/contributions-table';
import { getContributions } from '@/lib/api';
import { auth } from '@/auth';
import { getMemberByUserId } from '@/lib/api';
import { redirect } from 'next/navigation';

export default async function ContributionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const member = await getMemberByUserId(session.user.id);
  if (!member) {
    return <p>Member details not found.</p>;
  }
  
  const allContributions = await getContributions(undefined, member.id);

  return <ContributionsTable contributions={allContributions} />;
}
