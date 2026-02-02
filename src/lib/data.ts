import type { Member, Contribution, WelfareRequest } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const names = [
    'Kepher Otieno', 'Maureen Okeyo', 'Min Jared', 'Melvine Akoth', 'Caroline Dima', 'William Mugah',
    'Vilma William', 'Wilson Okeyo', 'Hawkins Okeyo', 'Mary Ann', 'Vickness Auma', 'Felix Odera',
    'Lucy Ombuga', 'Judith Odera', 'Alice Omondi', 'Janet Akinyi', 'Violet Orinda', 'Helen Mugah',
    'Jared Awuoche', 'Happiness Adhiambo', 'Nerea Kitoto', 'Charles Kitoto', 'Nicholas Kitoto',
    'Claris Adhiambo', 'Joshua Otieno', 'Emelda Erick', 'Erick Awuoche', 'Loise Okeyo', 'Grace Onjuma',
    'Pamela Otieno', 'Maureen Otieno', 'Nicholas Otieno', 'Deborah Nicholas', 'Pettybella Omondi',
    'Asha Okoth', 'Nancy Otieno', 'Mary Jared', 'Rehema Ooro', 'Lilian Ken', 'Shadrack Otieno',
    'Loise Otieno', 'Rosslyn Andango', 'Cynthia Andango', 'Chris Mugah', 'Audrey Andango',
    'Donna Andango', 'Betty Andango', 'Hellen Okoth', 'Dan Mugah', 'Lavin Akoth'
];

export const members: Member[] = names.map((name, index) => {
    const id = `MEM${(index + 1).toString().padStart(3, '0')}`;
    const emailName = name.split(' ').join('.').toLowerCase();
    const email = `${emailName}@example.com`;
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const memberSince = new Date(twoYearsAgo.getTime() + Math.random() * (Date.now() - twoYearsAgo.getTime())).toISOString().split('T')[0];

    return {
        id,
        name,
        email,
        memberSince,
        avatarUrl: PlaceHolderImages[index % 6].imageUrl,
        status: (index % 10 === 3) ? 'inactive' : 'active',
    };
});

const januaryContributions: Contribution[] = members.map((member, index) => ({
    id: `CONJAN${(index + 1).toString().padStart(3, '0')}`,
    memberId: member.id,
    memberName: member.name,
    date: '2024-01-15',
    amount: 300,
    method: index % 3 === 0 ? 'Bank Transfer' : 'Paybill',
}));


const otherContributions: Contribution[] = [
  // February contributions
  { id: 'CONFEB01', memberId: 'MEM049', memberName: 'Dan Mugah', date: '2024-02-10', amount: 300, method: 'Paybill' },
  { id: 'CONFEB02', memberId: 'MEM001', memberName: 'Kepher Otieno', date: '2024-02-11', amount: 300, method: 'Paybill' },
  { id: 'CONFEB03', memberId: 'MEM005', memberName: 'Caroline Dima', date: '2024-02-12', amount: 300, method: 'Paybill' },
  { id: 'CONFEB04', memberId: 'MEM006', memberName: 'William Mugah', date: '2024-02-13', amount: 300, method: 'Paybill' },
  { id: 'CONFEB05', memberId: 'MEM019', memberName: 'Jared Awuoche', date: '2024-02-14', amount: 300, method: 'Paybill' },
  { id: 'CONFEB06', memberId: 'MEM028', memberName: 'Loise Okeyo', date: '2024-02-15', amount: 300, method: 'Bank Transfer' },

  // March contributions
  { id: 'CONMAR01', memberId: 'MEM028', memberName: 'Loise Okeyo', date: '2024-03-15', amount: 300, method: 'Bank Transfer' },

  // Contributions from the list
  { id: 'CON001', memberId: 'MEM006', memberName: 'William Mugah', date: '2024-07-15', amount: 300, method: 'Paybill' },
  { id: 'CON002', memberId: 'MEM010', memberName: 'Mary Ann', date: '2024-07-15', amount: 300, method: 'Paybill' },
  { id: 'CON003', memberId: 'MEM019', memberName: 'Jared Awuoche', date: '2024-07-15', amount: 300, method: 'Paybill' },
  { id: 'CON004', memberId: 'MEM028', memberName: 'Loise Okeyo', date: '2024-07-15', amount: 600, method: 'Bank Transfer', isAnomalous: true, anomalyReason: 'Contribution is double the monthly amount.' },
  { id: 'CON005', memberId: 'MEM049', memberName: 'Dan Mugah', date: '2024-07-15', amount: 300, method: 'Paybill' },

];

export const contributions: Contribution[] = [...januaryContributions, ...otherContributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const welfareRequests: WelfareRequest[] = [
  { id: 'WEL001', memberId: 'MEM013', memberName: 'Lucy Ombuga', requestDate: '2024-06-15', amount: 500, reason: 'Medical Emergency', status: 'Approved' },
  { id: 'WEL002', memberId: 'MEM012', memberName: 'Felix Odera', requestDate: '2024-06-20', amount: 1000, reason: 'Education Fund', status: 'Disbursed' },
  { id: 'WEL003', memberId: 'MEM024', memberName: 'Claris Adhiambo', requestDate: '2024-07-05', amount: 750, reason: 'Home Repair', status: 'Pending' },
  { id: 'WEL004', memberId: 'MEM035', memberName: 'Asha Okoth', requestDate: '2024-07-10', amount: 200, reason: 'Family Support', status: 'Rejected' },
  { id: 'WEL005', memberId: 'MEM044', memberName: 'Chris Mugah', requestDate: '2024-07-12', amount: 1200, reason: 'Bereavement', status: 'Pending' },
];
