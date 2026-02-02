'use client';

import * as React from 'react';
import {
  AlertCircle,
  ListFilter,
  Search
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from './page-header';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function ContributionsTable({ contributions }: { contributions: Contribution[] }) {
  const [filter, setFilter] = React.useState<'all' | 'paybill' | 'bank'>('all');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    if (event.target.value) {
      params.set('query', event.target.value);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const filteredContributions = contributions.filter(c => {
    if (filter === 'paybill') return c.method === 'Paybill';
    if (filter === 'bank') return c.method === 'Bank Transfer';
    return true;
  });

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <PageHeader title="Contributions">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by member name..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-[300px]"
                onChange={handleSearch}
                defaultValue={searchParams.get('query') || ''}
              />
            </div>
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
          </div>
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>Contribution History</CardTitle>
            <CardDescription>
              A complete log of all member contributions. Anomalous contributions are flagged with an icon.
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
                {filteredContributions.length > 0 ? (
                  filteredContributions.map((contribution) => (
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
                        <div className="flex items-center justify-end gap-2">
                            {contribution.isAnomalous && (
                                <Tooltip>
                                <TooltipTrigger>
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{contribution.anomalyReason || 'Anomaly Detected'}</p>
                                </TooltipContent>
                                </Tooltip>
                            )}
                            {formatCurrency(contribution.amount)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No contributions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}