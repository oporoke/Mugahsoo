import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { members, contributions, welfareRequests } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Users, Activity, Wallet } from 'lucide-react';

export function DashboardStats() {
  const totalFundBalance = contributions.reduce((sum, c) => sum + c.amount, 0) - welfareRequests.filter(r => r.status === 'Disbursed').reduce((sum, r) => sum + r.amount, 0);
  const totalMembers = members.length;
  const pendingRequests = welfareRequests.filter(r => r.status === 'Pending').length;
  const activeMembers = members.filter(m => m.status === 'active').length;

  const stats = [
    { title: 'Total Fund Balance', value: formatCurrency(totalFundBalance), icon: DollarSign, description: 'Current total funds' },
    { title: 'Total Members', value: totalMembers, icon: Users, description: `${activeMembers} active` },
    { title: 'Pending Welfare', value: pendingRequests, icon: Activity, description: 'Requests needing review' },
    { title: 'This Month\'s Contributions', value: formatCurrency(300), icon: Wallet, description: 'Contributions in July' },
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
