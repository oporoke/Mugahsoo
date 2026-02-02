
'use client';

import * as React from 'react';
import { PlusCircle, Loader2, MoreHorizontal } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WelfareRequest, Member } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from './page-header';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { addWelfareRequestAction, updateWelfareRequestStatusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Role } from '@prisma/client';

export function WelfareTable({ requests, currentMember, role }: { requests: WelfareRequest[], currentMember: Member, role: Role }) {
  const { toast } = useToast();
  
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

  const handleStatusChange = async (requestId: string, status: WelfareRequest['status']) => {
    const result = await updateWelfareRequestStatusAction(requestId, status);
    if (result.success) {
        toast({ title: 'Success', description: result.message });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const isAdminOrTreasurer = role === 'ADMIN' || role === 'TREASURER';

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={isAdminOrTreasurer ? "Welfare Requests" : "Your Welfare Requests"}>
        <NewRequestDialog memberId={currentMember.id} />
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>
            {isAdminOrTreasurer ? "Manage all member welfare requests." : "Submit and track your welfare requests."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdminOrTreasurer && <TableHead>Member</TableHead>}
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {isAdminOrTreasurer && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    {isAdminOrTreasurer && <TableCell>{request.memberName}</TableCell>}
                    <TableCell>
                      {request.reason}
                    </TableCell>
                    <TableCell>
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
                    {isAdminOrTreasurer && (
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Approved')}>Approve</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Disbursed')}>Disburse</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Rejected')}>Reject</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={isAdminOrTreasurer ? 6 : 4} className="text-center">
                    No welfare requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function NewRequestDialog({ memberId }: { memberId: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await addWelfareRequestAction(formData);

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      setIsOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message ?? 'Failed to add request.' });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Welfare Request</DialogTitle>
            <DialogDescription>
              Log a new welfare request. The status will be set to 'Pending'.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <input type="hidden" name="memberId" value={memberId} />
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" name="reason" placeholder="Enter reason for the request..." required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
