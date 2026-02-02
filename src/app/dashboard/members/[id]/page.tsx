
import { auth } from '@/auth';
import { MemberProfile } from '@/components/member-profile';
import { getContributionsForMember, getMember, getWelfareRequestsForMember } from '@/lib/api';
import { notFound, redirect } from 'next/navigation';

export default async function MemberDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const member = await getMember(params.id);

  if (!member) {
    notFound();
  }

  const [contributions, welfareRequests] = await Promise.all([
    getContributionsForMember(member.id),
    getWelfareRequestsForMember(member.id),
  ]);

  return (
    <MemberProfile
      member={member}
      initialContributions={contributions}
      initialWelfareRequests={welfareRequests}
    />
  );
}
