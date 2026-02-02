
import { auth } from '@/auth';
import { PageHeader } from '@/components/page-header';
import { getMembers, getContributions, getWelfareRequests, getMemberByUserId } from '@/lib/api';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MembersTable } from '@/components/members-table';
import { ContributionsTable } from '@/components/contributions-table';
import { WelfareTable } from '@/components/welfare-table';

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const query = searchParams?.query || '';
  if (!query) {
    redirect('/dashboard');
  }

  const userRole = session.user.role;
  const currentMember = await getMemberByUserId(session.user.id);

  if (!currentMember) {
      return <p>Member details not found.</p>;
  }

  const [members, contributions, welfareRequests] = await Promise.all([
    userRole === 'ADMIN' ? getMembers({ query }) : Promise.resolve([]),
    getContributions({ query, memberId: userRole === 'MEMBER' ? currentMember.id : undefined }),
    getWelfareRequests({ query, memberId: userRole === 'MEMBER' ? currentMember.id : undefined }),
  ]);

  const tabs = [];
  if (userRole === 'ADMIN') {
    tabs.push({value: 'members', label: `Members (${members.length})`});
  }
  tabs.push({value: 'contributions', label: `Contributions (${contributions.length})`});
  tabs.push({value: 'welfare', label: `Welfare Requests (${welfareRequests.length})`});

  const defaultTab = tabs.find(tab => {
    if (tab.value === 'members') return members.length > 0;
    if (tab.value === 'contributions') return contributions.length > 0;
    if (tab.value === 'welfare') return welfareRequests.length > 0;
    return false;
  })?.value || tabs[0].value;
  
  const gridColsClass = tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={`Search Results for "${query}"`} />
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={`grid w-full ${gridColsClass}`}>
            {tabs.map(tab => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
        </TabsList>
        {userRole === 'ADMIN' && (
            <TabsContent value="members">
                <MembersTable members={members} showControls={false} />
            </TabsContent>
        )}
        <TabsContent value="contributions">
          <ContributionsTable contributions={contributions} showControls={false} />
        </TabsContent>
        <TabsContent value="welfare">
          <WelfareTable requests={welfareRequests} currentMember={currentMember} role={userRole} showControls={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
