
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { addContributionAction, addMemberAction } from '@/app/actions';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import type { Member, Contribution } from '@/lib/types';
import { getContributionsForMember } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { PageHeader } from './page-header';

export function MembersTable({ members }: { members: Member[] }) {
  const [isAddMemberOpen, setAddMemberOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleAddMemberSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await addMemberAction(formData);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      setAddMemberOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message ?? 'Failed to add member.',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <PageHeader title="Members">
          <Dialog open={isAddMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddMemberSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new member.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddMemberOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>Member List</CardTitle>
            <CardDescription>Manage your welfare fund members.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Member Since
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-muted-foreground">{member.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
          {member.status}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(member.memberSince).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DialogTrigger asChild>
                <DropdownMenuItem>View Details</DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <MemberDetailsDialog member={member} />
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

function MemberDetailsDialog({
  member,
}: {
  member: Member;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [contributions, setContributions] = React.useState<Contribution[]>([]);
  const [isLoadingContributions, setIsLoadingContributions] = React.useState(true);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const fetchMemberContributions = React.useCallback(async () => {
    setIsLoadingContributions(true);
    const memberContributions = await getContributionsForMember(member.id);
    setContributions(memberContributions);
    setIsLoadingContributions(false);
  }, [member.id]);

  React.useEffect(() => {
    fetchMemberContributions();
  }, [fetchMemberContributions]);


  const handleAddContribution = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.append('memberId', member.id);

    const result = await addContributionAction(formData);

    if (result.success) {
      toast({
        title: 'Contribution Added',
        description: `Contribution for ${member.name} has been recorded.`,
      });
      if (result.isAnomalous) {
        toast({
          variant: 'destructive',
          title: 'Anomaly Detected',
          description: result.reason,
        });
      }
      formRef.current?.reset();
      fetchMemberContributions(); // Refetch contributions
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add contribution.',
      });
    }

    setIsSubmitting(false);
  };

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Member Details: {member.name}</DialogTitle>
        <DialogDescription>
          View contributions and manage member-specific actions.
        </DialogDescription>
      </DialogHeader>
      <div className="grid md:grid-cols-2 gap-6 py-4">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>New Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleAddContribution} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add & Check for Anomaly
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Contribution History</h3>
          <Card>
            <CardContent className="p-0 max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingContributions ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                         <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : contributions.length > 0 ? (
                    contributions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {c.isAnomalous && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{c.anomalyReason || 'Anomaly Detected'}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {new Date(c.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(c.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        No contributions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <DialogFooter>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogTrigger>
      </DialogFooter>
    </DialogContent>
  );
}
