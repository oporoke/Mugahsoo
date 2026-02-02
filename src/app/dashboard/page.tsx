
import { getMemberByUserId, getContributionsForMember, getWelfareRequestsForMember } from '@/lib/api';
import { MemberProfile } from '@/components/member-profile';
import { notFound, redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { auth } from '@/auth';
import { DashboardStats } from '@/components/dashboard-stats';
import { OverviewChart } from '@/components/overview-chart';
import { RecentTransactionsTable } from '@/components/recent-transactions-table';


export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const member = await getMemberByUserId(session.user.id);

  if (!member) {
    notFound();
  }

  const [contributions, welfareRequests] = await Promise.all([
    getContributionsForMember(member.id),
    getWelfareRequestsForMember(member.id),
  ]);

  return (
    <>
      <div className="flex flex-col gap-8">
        <MemberProfile 
            member={member} 
            initialContributions={contributions} 
            initialWelfareRequests={welfareRequests} 
        />

        <div className="grid flex-1 items-start gap-4 md:gap-8">
            <PageHeader title="Your Dashboard" />
            <DashboardStats contributions={contributions} welfareRequests={welfareRequests} />
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <OverviewChart contributions={contributions} />
                <RecentTransactionsTable contributions={contributions} welfareRequests={welfareRequests} members={[member]} />
            </div>
        </div>
      </div>
    </>
  );
}
