
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Contribution, Member, WelfareRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Users, Activity, Landmark, HandCoins } from 'lucide-react';

interface DashboardStatsProps {
    contributions: Contribution[];
    welfareRequests: WelfareRequest[];
}

export function DashboardStats({ contributions, welfareRequests }: DashboardStatsProps) {
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalDisbursed = welfareRequests.filter(r => r.status === 'Disbursed').reduce((sum, r) => sum + r.amount, 0);
  const pendingRequests = welfareRequests.filter(r => r.status === 'Pending').length;
  
  const latestContributionDate = contributions.length > 0 ? new Date(contributions[0].date) : new Date();
  const currentMonthIndex = latestContributionDate.getMonth();
  const currentYear = latestContributionDate.getFullYear();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const thisMonthContributions = contributions.filter(c => {
    const date = new Date(c.date);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonthIndex;
  });
  const thisMonthTotal = thisMonthContributions.reduce((sum, c) => sum + c.amount, 0);
  const thisMonthName = monthNames[currentMonthIndex];


  const stats = [
    { title: 'Your Total Contributions', value: formatCurrency(totalContributions), icon: HandCoins, description: 'All your contributions' },
    { title: 'Total Disbursed to You', value: formatCurrency(totalDisbursed), icon: Wallet, description: 'Total welfare funds received' },
    { title: 'Your Pending Requests', value: pendingRequests, icon: Activity, description: 'Requests needing review' },
    { title: 'This Month\'s Contributions', value: formatCurrency(thisMonthTotal), icon: Wallet, description: `Your contributions in ${thisMonthName}` },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
