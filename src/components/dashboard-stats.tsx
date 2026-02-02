
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Contribution, Member, WelfareRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Users, Activity, Landmark } from 'lucide-react';

interface DashboardStatsProps {
    members: Member[];
    contributions: Contribution[];
    welfareRequests: WelfareRequest[];
}

export function DashboardStats({ members, contributions, welfareRequests }: DashboardStatsProps) {
  const totalFundBalance = contributions.reduce((sum, c) => sum + c.amount, 0) - welfareRequests.filter(r => r.status === 'Disbursed').reduce((sum, r) => sum + r.amount, 0);
  const totalMembers = members.length;
  const pendingRequests = welfareRequests.filter(r => r.status === 'Pending').length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  
  const latestContributionDate = contributions.length > 0 ? new Date(contributions[0].date) : new Date();
  const currentMonthIndex = latestContributionDate.getMonth();
  const currentYear = latestContributionDate.getFullYear();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // This Month
  const thisMonthContributions = contributions.filter(c => {
    const date = new Date(c.date);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonthIndex;
  });
  const thisMonthTotal = thisMonthContributions.reduce((sum, c) => sum + c.amount, 0);
  const thisMonthName = monthNames[currentMonthIndex];

  // Last Month
  const lastMonthDate = new Date(currentYear, currentMonthIndex - 1, 1);
  const lastMonthIndex = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const lastMonthContributions = contributions.filter(c => {
    const date = new Date(c.date);
    return date.getFullYear() === lastMonthYear && date.getMonth() === lastMonthIndex;
  });
  const lastMonthTotal = lastMonthContributions.reduce((sum, c) => sum + c.amount, 0);
  const lastMonthName = monthNames[lastMonthIndex];


  const stats = [
    { title: 'Total Fund Balance', value: formatCurrency(totalFundBalance), icon: Landmark, description: 'Current total funds' },
    { title: 'Total Members', value: totalMembers, icon: Users, description: `${activeMembers} active` },
    { title: 'Pending Welfare', value: pendingRequests, icon: Activity, description: 'Requests needing review' },
    { title: 'Last Month\'s Contributions', value: formatCurrency(lastMonthTotal), icon: Wallet, description: `Contributions in ${lastMonthName}` },
    { title: 'This Month\'s Contributions', value: formatCurrency(thisMonthTotal), icon: Wallet, description: `Contributions in ${thisMonthName}` },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

