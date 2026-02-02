
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Contribution, Member, WelfareRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Users, Landmark, Scale } from 'lucide-react';

interface AdminDashboardStatsProps {
    members: Member[];
    contributions: Contribution[];
    welfareRequests: WelfareRequest[];
}

export function AdminDashboardStats({ members, contributions, welfareRequests }: AdminDashboardStatsProps) {
  const totalMembers = members.length;
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalDisbursed = welfareRequests.filter(r => r.status === 'Disbursed').reduce((sum, r) => sum + r.amount, 0);
  const netFunds = totalContributions - totalDisbursed;
  
  const stats = [
    { title: 'Total Members', value: totalMembers, icon: Users, description: 'Total active and inactive members' },
    { title: 'Total Contributions', value: formatCurrency(totalContributions), icon: Landmark, description: 'All-time contributions received' },
    { title: 'Total Disbursed', value: formatCurrency(totalDisbursed), icon: Wallet, description: 'All-time welfare funds disbursed' },
    { title: 'Net Funds', value: formatCurrency(netFunds), icon: Scale, description: 'Current estimated balance' },
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
