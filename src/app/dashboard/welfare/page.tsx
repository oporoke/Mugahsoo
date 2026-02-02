
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

    const allRequests = await getWelfareRequests(member.id);

    return <WelfareTable requests={allRequests} currentMember={member} />;
}
