'use server';

import { flagAnomalousContributions, FlagAnomalousContributionsInput } from '@/ai/flows/flag-anomalous-contributions';
import { revalidatePath } from 'next/cache';

// In a real app, you would have a database and API calls here.
// For now, we simulate and revalidate paths to trigger UI updates.

export async function addMemberAction(formData: FormData) {
  const member = {
    name: formData.get('name'),
    email: formData.get('email'),
  };
  console.log('Adding new member:', member);
  // Simulate adding to a database
  revalidatePath('/dashboard/members');
  return { success: true, message: `Member ${member.name} added successfully.` };
}

export async function addContributionAction(formData: FormData) {
  const memberId = formData.get('memberId') as string;
  const amount = Number(formData.get('amount'));
  const date = new Date().toISOString().split('T')[0];

  // In a real app, you'd fetch the member's full contribution history from a database.
  // For this demo, we'll use a mock history.
  const mockHistory = [
    { date: '2024-04-01', amount: 100 },
    { date: '2024-05-01', amount: 100 },
    { date: '2024-06-01', amount: 100 },
  ];

  const input: FlagAnomalousContributionsInput = {
    memberId,
    contributionHistory: [...mockHistory, { date, amount }],
  };

  try {
    const result = await flagAnomalousContributions(input);
    console.log('Contribution added and checked for anomaly:', { memberId, amount, date, anomalyResult: result });
    
    // Here you would save the contribution to the database, including the anomaly flag.
    
    revalidatePath('/dashboard/contributions');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/members');

    return { success: true, ...result };
  } catch (error) {
    console.error('Error during anomaly check:', error);
    return { success: false, isAnomalous: false, reason: 'An error occurred while checking the contribution.' };
  }
}
