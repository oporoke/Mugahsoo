
'use server';

import { flagAnomalousContributions, FlagAnomalousContributionsInput } from '@/ai/flows/flag-anomalous-contributions';
import { revalidatePath } from 'next/cache';
import { 
  addMember as dbAddMember, 
  addContribution as dbAddContribution, 
  getContributionsForMember, 
  getMember,
  updateMember as dbUpdateMember,
  deleteMember as dbDeleteMember,
  addWelfareRequest as dbAddWelfareRequest,
  updateWelfareRequestStatus as dbUpdateWelfareRequestStatus,
  createUserAndMember,
  getUserByEmail,
} from '@/lib/api';
import type { WelfareRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { auth, signIn } from '@/auth';
import prisma from '@/lib/prisma';

export async function signupAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { success: false, message: 'Name, email, and password are required.' };
  }
  
  if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    if (existingUser.password) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    // User was likely created by an admin and has no password. Let's set it.
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await prisma.user.update({
            where: { email: email },
            data: { 
                name: name,
                password: hashedPassword 
            },
        });
        // Also update the associated member's name
        await prisma.member.update({
            where: { userId: existingUser.id },
            data: { name: name }
        });
        console.log('User password set for existing user:', { name, email });
    } catch (error) {
        console.error('Error setting password for existing user:', error);
        return { success: false, message: 'Something went wrong. Please try again.' };
    }
  } else {
    // User does not exist, create a new one.
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await createUserAndMember({ name, email, password: hashedPassword });
        console.log('New user signed up:', { name, email });
    } catch (error) {
        console.error('Error during sign up:', error);
        return { success: false, message: 'Something went wrong. Please try again.' };
    }
  }
  
  // Automatically sign in the user after successful registration
  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
  } catch (error) {
     console.error("Sign in after signup failed:", error);
     // If sign-in fails, redirect to login page for manual login
     redirect('/login');
  }
}


export async function addMemberAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  if (!name || !email) {
    return { success: false, message: 'Name and email are required.' };
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { success: false, message: 'A member with this email already exists.' };
  }

  try {
    await createUserAndMember({ name, email });
    console.log('Adding new member:', {name, email});
    revalidatePath('/dashboard');
    return { success: true, message: `Member ${name} added successfully.` };
  } catch (error) {
    console.error('Error adding member:', error);
    return { success: false, message: 'Failed to add member.' };
  }
}

export async function updateMemberAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const status = formData.get('status') as 'active' | 'inactive' | undefined;

  if (!id || !name || !email) {
    return { success: false, message: 'Name and email are required.' };
  }

  try {
    await dbUpdateMember(id, { name, email, status: status ?? 'active' });
    revalidatePath(`/dashboard`);
    revalidatePath('/dashboard/contributions');
    revalidatePath('/dashboard/welfare');
    return { success: true, message: `Profile updated successfully.` };
  } catch (error) {
    console.error('Error updating member:', error);
    return { success: false, message: 'Failed to update member. Email might already exist.' };
  }
}

export async function deleteMemberAction(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) {
        return { success: false, message: 'Member ID is required.' };
    }

    try {
        await dbDeleteMember(id);
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/contributions');
        revalidatePath('/dashboard/welfare');
        return { success: true, message: 'Member deleted successfully.' };
    } catch (error) {
        console.error('Error deleting member:', error);
        return { success: false, message: 'Failed to delete member.' };
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
    
    revalidatePath(`/dashboard`);
    revalidatePath('/dashboard/contributions');

    return { success: true, ...result };
  } catch (error) {
    console.error('Error during anomaly check:', error);
    return { success: false, isAnomalous: false, reason: 'An error occurred while checking the contribution.' };
  }
}


export async function addWelfareRequestAction(formData: FormData) {
  const memberId = formData.get('memberId') as string;
  const amount = Number(formData.get('amount'));
  const reason = formData.get('reason') as string;

  if (!memberId || !amount || !reason) {
    return { success: false, message: 'Member, amount, and reason are required.' };
  }

  try {
    const newRequest = await dbAddWelfareRequest({ memberId, amount, reason });
    if (newRequest) {
      console.log(`[SIMULATED NOTIFICATION] Admin notified: New welfare request for ${newRequest.memberName} for ${formatCurrency(newRequest.amount)}.`);
    }
    revalidatePath('/dashboard/welfare');
    revalidatePath('/dashboard');
    return { success: true, message: 'Welfare request added successfully.' };
  } catch (error) {
    console.error('Error adding welfare request:', error);
    return { success: false, message: 'Failed to add welfare request.' };
  }
}

export async function updateWelfareRequestStatusAction(requestId: string, status: WelfareRequest['status']) {
  const session = await auth();
  const userRole = session?.user.role;

  if (userRole !== 'ADMIN' && userRole !== 'TREASURER') {
      return { success: false, message: 'You are not authorized to perform this action.' };
  }
  
  try {
    const updatedRequest = await dbUpdateWelfareRequestStatus(requestId, status);
    if (updatedRequest) {
        console.log(`[SIMULATED NOTIFICATION] Member ${updatedRequest.memberName} notified: Their welfare request status has been updated to "${status}".`);
    }
    revalidatePath('/dashboard/welfare');
    revalidatePath('/dashboard');
    return { success: true, message: `Request status updated to ${status}.` };
  } catch (error) {
    console.error('Error updating welfare request status:', error);
    return { success: false, message: 'Failed to update request status.' };
  }
}
