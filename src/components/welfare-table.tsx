
'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WelfareRequest, Member } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from './page-header';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { addWelfareRequestAction, updateWelfareRequestStatusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function WelfareTable({ requests, members }: { requests: WelfareRequest[], members: Member[] }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusChange = async (id: string, status: WelfareRequest['status']) => {
    const result = await updateWelfareRequestStatusAction(id, status);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      // The page will be revalidated by the server action
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

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
        <NewRequestDialog members={members} />
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
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/members/${request.memberId}`)}>
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Approved')} disabled={request.status === 'Approved' || request.status === 'Disbursed'}>Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Rejected')} disabled={request.status === 'Rejected'}>Reject</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Disbursed')} disabled={request.status !== 'Approved'}>Mark as Disbursed</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center">
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

function NewRequestDialog({ members }: { members: Member[] }) {
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
              Log a new welfare request for a member. The status will be set to 'Pending'.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="memberId">Member</Label>
              <Select name="memberId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
  )
}
