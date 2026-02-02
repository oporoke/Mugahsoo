import { MembersTable } from '@/components/members-table';
import { members } from '@/lib/data';

export default function MembersPage() {
  // In a real app, you'd fetch members from an API
  const allMembers = members;

  return <MembersTable members={allMembers} />;
}
