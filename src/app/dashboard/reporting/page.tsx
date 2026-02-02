
import { getContributions, getWelfareRequests, getMembers } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { FinancialStatement } from '@/components/financial-statement';
import { ExportButton } from '@/components/export-button';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ReportingPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  if (userRole !== 'ADMIN' && userRole !== 'TREASURER') {
    redirect('/dashboard');
  }

  const [contributions, welfareRequests, members] = await Promise.all([
    getContributions(),
    getWelfareRequests(),
    getMembers(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="no-print">
        <PageHeader title="Reporting & Exports">
          <div className="flex gap-2">
              <ExportButton
                data={members}
                filename="members.csv"
                buttonText="Export Members (CSV)"
              />
              <ExportButton
                data={contributions}
                filename="contributions.csv"
                buttonText="Export Contributions (CSV)"
              />
              <ExportButton
                data={welfareRequests}
                filename="welfare-requests.csv"                
                buttonText="Export Welfare (CSV)"
              />
          </div>
        </PageHeader>
      </div>
      
      <FinancialStatement contributions={contributions} welfareRequests={welfareRequests} />
    </div>
  );
}
