'use client';

import * as React from 'react';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Contribution } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from './page-header';

export function ContributionsTable({ contributions }: { contributions: Contribution[] }) {
  const [filter, setFilter] = React.useState<'all' | 'paybill' | 'bank'>('all');

  const filteredContributions = contributions.filter(c => {
    if (filter === 'paybill') return c.method === 'Paybill';
    if (filter === 'bank') return c.method === 'Bank Transfer';
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Contributions">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <ListFilter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Filter
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Method</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filter === 'all'}
              onCheckedChange={() => setFilter('all')}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === 'paybill'}
              onCheckedChange={() => setFilter('paybill')}
            >
              Paybill
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === 'bank'}
              onCheckedChange={() => setFilter('bank')}
            >
              Bank Transfer
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Contribution History</CardTitle>
          <CardDescription>
            A complete log of all member contributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContributions.map((contribution) => (
                <TableRow key={contribution.id}>
                  <TableCell className="font-medium">
                    {contribution.memberName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{contribution.method}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(contribution.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(contribution.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
