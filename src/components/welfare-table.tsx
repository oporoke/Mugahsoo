'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WelfareRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from './page-header';

export function WelfareTable({ requests }: { requests: WelfareRequest[] }) {
  const getStatusBadge = (status: WelfareRequest['status']) => {
    switch (status) {
      case 'Pending':
        return 'default';
      case 'Approved':
        return 'secondary';
      case 'Disbursed':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Welfare Requests">
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          New Request
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>
            Process and track all member welfare requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.memberName}
                  </TableCell>
                  <TableCell>
                    {request.reason}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={getStatusBadge(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(request.requestDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(request.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Approve</DropdownMenuItem>
                        <DropdownMenuItem>Reject</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Disbursed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
