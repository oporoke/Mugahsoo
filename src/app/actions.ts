
'use server';

import { flagAnomalousContributions, FlagAnomalousContributionsInput } from '@/ai/flows/flag-anomalous-contributions';
import { revalidatePath } from 'next/cache';
import { addMember as dbAddMember, addContribution as dbAddContribution, getContributionsForMember, getMember } from '@/lib/api';

export async function addMemberAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  if (!name || !email) {
    return { success: false, message: 'Name and email are required.' };
  }

  try {
    await dbAddMember({ name, email });
    console.log('Adding new member:', {name, email});
    revalidatePath('/dashboard/members');
    return { success: true, message: `Member ${name} added successfully.` };
  } catch (error) {
    console.error('Error adding member:', error);
    return { success: false, message: 'Failed to add member. Email might already exist.' };
  }
}

export async function addContributionAction(formData: FormData) {
  const memberId = formData.get('memberId') as string;
  const amount = Number(formData.get('amount'));
  const date = new Date().toISOString().split('T')[0];

  const member = await getMember(memberId);
  if (!member) {
      return { success: false, isAnomalous: false, reason: 'Member not found.' };
  }

  const contributionHistory = await getContributionsForMember(memberId);

  const input: FlagAnomalousContributionsInput = {
    memberId,
    contributionHistory: [...contributionHistory, { date, amount }],
  };

  try {
    const result = await flagAnomalousContributions(input);
    console.log('Contribution added and checked for anomaly:', { memberId, amount, date, anomalyResult: result });
    
    await dbAddContribution({
      memberId,
      amount,
      date,
      isAnomalous: result.isAnomalous,
      anomalyReason: result.reason
    });
    
    revalidatePath('/dashboard/contributions');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/members');

    return { success: true, ...result };
  } catch (error) {
    console.error('Error during anomaly check:', error);
    return { success: false, isAnomalous: false, reason: 'An error occurred while checking the contribution.' };
  }
}
