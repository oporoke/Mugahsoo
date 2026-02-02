
import { WelfareTable } from '@/components/welfare-table';
import { getWelfareRequests, getMemberByUserId } from '@/lib/api';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function WelfarePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const member = await getMemberByUserId(session.user.id);
    if (!member) {
        return <p>Member details not found.</p>;
    }
    
    const userRole = session.user.role;
    let memberIdForQuery: string | undefined;

    // Members only see their own requests. Admins/Treasurers see all.
    if (userRole === 'MEMBER') {
        memberIdForQuery = member.id;
    }

    const allRequests = await getWelfareRequests(memberIdForQuery);

    return <WelfareTable requests={allRequests} currentMember={member} role={userRole} />;
}
