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
import { contributions, welfareRequests, members } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function RecentTransactionsTable() {
  const transactions = [
    ...contributions.slice(0, 3).map(c => ({...c, type: 'contribution'})),
    ...welfareRequests.filter(w => w.status === 'Disbursed').slice(0, 2).map(w => ({...w, type: 'disbursement'}))
  ]
  .sort((a, b) => new Date(b.date || b.requestDate).getTime() - new Date(a.date || a.requestDate).getTime());

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Recent contributions and welfare disbursements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
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
                <TableCell className="text-center">
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
