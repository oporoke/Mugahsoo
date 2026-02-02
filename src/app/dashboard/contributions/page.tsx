
import { ContributionsTable } from '@/components/contributions-table';
import { getContributions } from '@/lib/api';

export default async function ContributionsPage({ searchParams }: { searchParams?: { query?: string } }) {
  const query = searchParams?.query || '';
  const allContributions = await getContributions(query);

  return <ContributionsTable contributions={allContributions} />;
}
