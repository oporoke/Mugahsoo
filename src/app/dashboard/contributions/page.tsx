
import { ContributionsTable } from '@/components/contributions-table';
import { getContributions } from '@/lib/api';

export default async function ContributionsPage() {
  const allContributions = await getContributions();

  return <ContributionsTable contributions={allContributions} />;
}
