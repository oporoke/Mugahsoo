
import { getMemberByUserId, getContributionsForMember, getWelfareRequestsForMember, getDashboardData } from '@/lib/api';
import { MemberProfile } from '@/components/member-profile';
import { notFound, redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { auth } from '@/auth';
import { DashboardStats } from '@/components/dashboard-stats';
import { OverviewChart } from '@/components/overview-chart';
import { RecentTransactionsTable } from '@/components/recent-transactions-table';
import { AdminDashboard } from '@/components/admin-dashboard';
import type { Role } from '@prisma/client';


export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userRole = session.user.role as Role;

  if (userRole === 'ADMIN' || userRole === 'TREASURER') {
    const { members, contributions, welfareRequests } = await getDashboardData();
    return (
        <AdminDashboard 
            members={members}
            contributions={contributions}
            welfareRequests={welfareRequests}
        />
    )
  }

  const member = await getMemberByUserId(session.user.id);

  if (!member) {
    // This could happen if a user exists but the member record wasn't created.
    // Or if the user is an admin without a member record for themselves.
    // For now, we show a not found page. A better UX might guide them.
    notFound();
  }

  const [contributions, welfareRequests] = await Promise.all([
    getContributionsForMember(member.id),
    getWelfareRequestsForMember(member.id),
  ]);

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* The main member dashboard is effectively the member profile view */}
        <div className="grid flex-1 items-start gap-4 md:gap-8">
            <PageHeader title="Your Dashboard" />
            <DashboardStats contributions={contributions} welfareRequests={welfareRequests} />
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <OverviewChart contributions={contributions} />
                <RecentTransactionsTable contributions={contributions} welfareRequests={welfareRequests} members={[member]} />
            </div>
        </div>
        
        {/* And below, we show the detailed profile */}
        <MemberProfile 
            member={member} 
            initialContributions={contributions} 
            initialWelfareRequests={welfareRequests}
            currentUserRole={userRole}
        />
      </div>
    </>
  );
}
