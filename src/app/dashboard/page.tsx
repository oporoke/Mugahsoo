
import { DashboardStats } from '@/components/dashboard-stats';
import { OverviewChart } from '@/components/overview-chart';
import { RecentTransactionsTable } from '@/components/recent-transactions-table';
import { PageHeader } from '@/components/page-header';
import { getDashboardData } from '@/lib/api';

export default async function DashboardPage() {
  const { members, contributions, welfareRequests } = await getDashboardData();

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid flex-1 items-start gap-4 md:gap-8">
        <DashboardStats contributions={contributions} members={members} welfareRequests={welfareRequests} />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <OverviewChart contributions={contributions} />
            <RecentTransactionsTable contributions={contributions} welfareRequests={welfareRequests} members={members} />
        </div>
      </div>
    </>
  );
}
