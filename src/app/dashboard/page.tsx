import { DashboardStats } from '@/components/dashboard-stats';
import { OverviewChart } from '@/components/overview-chart';
import { RecentTransactionsTable } from '@/components/recent-transactions-table';
import { PageHeader } from '@/components/page-header';

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid flex-1 items-start gap-4 md:gap-8">
        <DashboardStats />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <OverviewChart />
            <RecentTransactionsTable />
        </div>
      </div>
    </>
  );
}
