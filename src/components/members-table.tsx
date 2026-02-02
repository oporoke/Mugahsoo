
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { addContributionAction, addMemberAction, updateMemberAction, deleteMemberAction } from '@/app/actions';
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
  DropdownMenuSeparator,
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
import type { Member, Contribution, WelfareRequest } from '@/lib/types';
import { getContributionsForMember, getWelfareRequestsForMember } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { PageHeader } from './page-header';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

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
  const [isDetailsOpen, setDetailsOpen] = React.useState(false);
  const [isEditOpen, setEditOpen] = React.useState(false);

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setDetailsOpen(true)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteConfirmationMenuItem member={member} />
          </DropdownMenuContent>
        </DropdownMenu>

        <MemberDetailsDialog
          member={member}
          isOpen={isDetailsOpen}
          setIsOpen={setDetailsOpen}
        />
        <EditMemberDialog
          member={member}
          isOpen={isEditOpen}
          setIsOpen={setEditOpen}
        />
      </TableCell>
    </TableRow>
  );
}

function EditMemberDialog({ member, isOpen, setIsOpen }: { member: Member, isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.append('id', member.id);
    const result = await updateMemberAction(formData);

    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      setIsOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message ?? 'Failed to update member.',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <form onSubmit={handleEditSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Member: {member.name}</DialogTitle>
            <DialogDescription>
              Update the member's details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={member.name} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={member.email} required />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <RadioGroup name="status" defaultValue={member.status} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmationMenuItem({ member }: { member: Member }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('id', member.id);
    const result = await deleteMemberAction(formData);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      setIsOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message ?? 'Failed to delete member.',
      });
    }
    setIsSubmitting(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(e) => { e.preventDefault(); setIsOpen(true); }}
        >
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {member.name} and all of their associated data (contributions, welfare requests, etc.) from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MemberDetailsDialog({ member, isOpen, setIsOpen }: { member: Member, isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [contributions, setContributions] = React.useState<Contribution[]>([]);
  const [welfareRequests, setWelfareRequests] = React.useState<WelfareRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    const [contribs, requests] = await Promise.all([
      getContributionsForMember(member.id),
      getWelfareRequestsForMember(member.id)
    ]);
    setContributions(contribs);
    setWelfareRequests(requests);
    setIsLoading(false);
  }, [member.id]);

  React.useEffect(() => {
    if(isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);


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
      fetchData(); // Refetch all data
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add contribution.',
      });
    }
    setIsSubmitting(false);
  };

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Member Details: {member.name}</DialogTitle>
          <DialogDescription>
            View contributions and welfare history, and manage member-specific actions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-1">
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
          <div className="md:col-span-2">
            <Tabs defaultValue="contributions">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contributions">Contribution History</TabsTrigger>
                <TabsTrigger value="welfare">Welfare History</TabsTrigger>
              </TabsList>
              <TabsContent value="contributions">
                <Card>
                  <CardContent className="p-0 max-h-72 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contributions.length > 0 ? (
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="welfare">
                 <Card>
                  <CardContent className="p-0 max-h-72 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Reason</TableHead>
                             <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {welfareRequests.length > 0 ? (
                            welfareRequests.map((r) => (
                              <TableRow key={r.id}>
                                <TableCell>{new Date(r.requestDate).toLocaleDateString()}</TableCell>
                                <TableCell>{r.reason}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusBadge(r.status)}>
                                    {r.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(r.amount)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center">
                                No welfare requests yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}