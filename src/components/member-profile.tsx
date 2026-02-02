
'use client';

import * as React from 'react';
import {
  AlertCircle,
  Loader2,
  Edit
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { updateMemberAction } from '@/app/actions';
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
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';


export function MemberProfile({ 
  member, 
  initialContributions, 
  initialWelfareRequests 
}: { 
  member: Member;
  initialContributions: Contribution[];
  initialWelfareRequests: WelfareRequest[];
}) {
  const [isEditOpen, setEditOpen] = React.useState(false);
  
  const [contributions, setContributions] = React.useState<Contribution[]>(initialContributions);
  const [welfareRequests, setWelfareRequests] = React.useState<WelfareRequest[]>(initialWelfareRequests);
  const [isLoading, setIsLoading] = React.useState(false);

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
    <TooltipProvider>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
               <Avatar className="h-20 w-20">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                 <CardTitle className="text-2xl">{member.name}</CardTitle>
                 <CardDescription>{member.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                    </Badge>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span>{new Date(member.memberSince).toLocaleDateString()}</span>
                </div>
            </CardContent>
             <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => setEditOpen(true)}><Edit className="mr-2 h-4 w-4"/> Edit Profile</Button>
              </div>
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
                <CardHeader>
                    <CardTitle>Contribution History</CardTitle>
                    <CardDescription>A log of all contributions from {member.name}.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
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
                                      <TooltipTrigger><AlertCircle className="h-4 w-4 text-destructive" /></TooltipTrigger>
                                      <TooltipContent><p>{c.anomalyReason || 'Anomaly Detected'}</p></TooltipContent>
                                    </Tooltip>
                                  )}
                                  {new Date(c.date).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(c.amount)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow><TableCell colSpan={2} className="text-center">No contributions yet.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="welfare">
                <Card>
                    <CardHeader>
                        <CardTitle>Welfare Request History</CardTitle>
                        <CardDescription>A log of all welfare requests from {member.name}.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
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
                                <TableCell><Badge variant={getStatusBadge(r.status)}>{r.status}</Badge></TableCell>
                                <TableCell className="text-right">{formatCurrency(r.amount)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow><TableCell colSpan={4} className="text-center">No welfare requests yet.</TableCell></TableRow>
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
      <EditMemberDialog member={member} isOpen={isEditOpen} setIsOpen={setEditOpen} />
    </TooltipProvider>
  );
}

function EditMemberDialog({ member, isOpen, setIsOpen }: { member: Member, isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
      router.refresh(); 
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
            <DialogTitle>Edit Profile: {member.name}</DialogTitle>
            <DialogDescription>Update your details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" defaultValue={member.name} required /></div>
            <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={member.email} required /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
