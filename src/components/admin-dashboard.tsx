
import { PageHeader } from '@/components/page-header';
import type { Contribution, Member, WelfareRequest } from '@/lib/types';
import { AdminDashboardStats } from './admin-dashboard-stats';
import { OverviewChart } from './overview-chart';
import { RecentTransactionsTable } from './recent-transactions-table';

interface AdminDashboardProps {
    members: Member[];
    contributions: Contribution[];
    welfareRequests: WelfareRequest[];
}

export function AdminDashboard({ members, contributions, welfareRequests }: AdminDashboardProps) {
    return (
        <div className="flex flex-col gap-8">
             <div className="grid flex-1 items-start gap-4 md:gap-8">
                <PageHeader title="Admin Dashboard" />
                <AdminDashboardStats members={members} contributions={contributions} welfareRequests={welfareRequests} />
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <OverviewChart contributions={contributions} />
                    <RecentTransactionsTable contributions={contributions} welfareRequests={welfareRequests} members={members} />
                </div>
            </div>
        </div>
    )
}
