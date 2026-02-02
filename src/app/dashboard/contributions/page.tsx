import { ContributionsTable } from '@/components/contributions-table';
import { contributions } from '@/lib/data';

export default function ContributionsPage() {
  // In a real app, you'd fetch data from an API
  const allContributions = contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <ContributionsTable contributions={allContributions} />;
}
