
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Contribution, Member, WelfareRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface RecentTransactionsTableProps {
    members: Member[];
    contributions: Contribution[];
    welfareRequests: WelfareRequest[];
}

export function RecentTransactionsTable({ members, contributions, welfareRequests }: RecentTransactionsTableProps) {
    const allTransactions = [
    ...contributions.map(c => ({
      id: `c-${c.id}`,
      type: 'contribution' as const,
      date: c.date,
      ...c,
    })),
    ...welfareRequests
      .filter(w => w.status === 'Disbursed')
      .map(w => ({
        id: `w-${w.id}`,
        type: 'disbursement' as const,
        date: w.requestDate,
        ...w,
      })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Card className="lg:col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your 5 most recent contributions and welfare disbursements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="hidden text-center sm:table-cell">Type</TableHead>
              <TableHead className="hidden text-center md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTransactions.map((transaction) => {
              const member = members.find(m => m.id === transaction.memberId);
              return (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                       <AvatarImage src={member?.avatarUrl} alt={member?.name} />
                      <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{transaction.memberName}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-center sm:table-cell">
                  {transaction.type === 'contribution' ? (
                    <Badge variant="outline" className="text-green-600 border-green-600/50">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      Contribution
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-600/50">
                      <ArrowDownLeft className="mr-1 h-3 w-3" />
                      Disbursement
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden text-center md:table-cell">
                    {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'contribution' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
