
import { getMember, getContributionsForMember, getWelfareRequestsForMember } from '@/lib/api';
import { MemberProfile } from '@/components/member-profile';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function MemberDetailsPage({ params }: { params: { id: string } }) {
  const member = await getMember(params.id);

  if (!member) {
    notFound();
  }

  const [contributions, welfareRequests] = await Promise.all([
    getContributionsForMember(params.id),
    getWelfareRequestsForMember(params.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
       <PageHeader title={member.name}>
        <Button variant="outline" asChild>
          <Link href="/dashboard/members">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </Button>
      </PageHeader>
      <MemberProfile 
        member={member} 
        initialContributions={contributions} 
        initialWelfareRequests={welfareRequests} 
      />
    </div>
  );
}
