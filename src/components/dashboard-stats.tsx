import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { members, contributions, welfareRequests } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Landmark, Users, Activity, Wallet } from 'lucide-react';

export function DashboardStats() {
  const totalFundBalance = contributions.reduce((sum, c) => sum + c.amount, 0) - welfareRequests.filter(r => r.status === 'Disbursed').reduce((sum, r) => sum + r.amount, 0);
  const totalMembers = members.length;
  const pendingRequests = welfareRequests.filter(r => r.status === 'Pending').length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  
  const latestContributionDate = contributions.length > 0 ? new Date(contributions[0].date) : new Date();
  const latestMonth = latestContributionDate.getMonth();
  const latestYear = latestContributionDate.getFullYear();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const latestMonthContributions = contributions.filter(c => {
    const date = new Date(c.date);
    return date.getFullYear() === latestYear && date.getMonth() === latestMonth;
  });
  const latestMonthTotal = latestMonthContributions.reduce((sum, c) => sum + c.amount, 0);

  const stats = [
    { title: 'Total Fund Balance', value: formatCurrency(totalFundBalance), icon: Landmark, description: 'Current total funds' },
    { title: 'Total Members', value: totalMembers, icon: Users, description: `${activeMembers} active` },
    { title: 'Pending Welfare', value: pendingRequests, icon: Activity, description: 'Requests needing review' },
    { title: 'Latest Month\'s Contributions', value: formatCurrency(latestMonthTotal), icon: Wallet, description: `Contributions in ${monthNames[latestMonth]}` },
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
