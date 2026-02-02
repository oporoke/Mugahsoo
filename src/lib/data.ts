import type { Member, Contribution, WelfareRequest } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const members: Member[] = [
  { id: 'MEM001', name: 'Alice Johnson', email: 'alice.j@example.com', memberSince: '2022-01-15', avatarUrl: PlaceHolderImages[0].imageUrl, status: 'active' },
  { id: 'MEM002', name: 'Bob Williams', email: 'bob.w@example.com', memberSince: '2022-02-20', avatarUrl: PlaceHolderImages[1].imageUrl, status: 'active' },
  { id: 'MEM003', name: 'Charlie Brown', email: 'charlie.b@example.com', memberSince: '2022-03-10', avatarUrl: PlaceHolderImages[2].imageUrl, status: 'inactive' },
  { id: 'MEM004', name: 'Diana Miller', email: 'diana.m@example.com', memberSince: '2022-04-05', avatarUrl: PlaceHolderImages[3].imageUrl, status: 'active' },
  { id: 'MEM005', name: 'Ethan Davis', email: 'ethan.d@example.com', memberSince: '2022-05-25', avatarUrl: PlaceHolderImages[4].imageUrl, status: 'active' },
  { id: 'MEM006', name: 'Fiona Garcia', email: 'fiona.g@example.com', memberSince: '2022-06-18', avatarUrl: PlaceHolderImages[5].imageUrl, status: 'active' },
];

export const contributions: Contribution[] = [
  { id: 'CON001', memberId: 'MEM001', memberName: 'Alice Johnson', date: '2024-07-01', amount: 100, method: 'Paybill' },
  { id: 'CON002', memberId: 'MEM002', memberName: 'Bob Williams', date: '2024-07-01', amount: 100, method: 'Paybill' },
  { id: 'CON003', memberId: 'MEM004', memberName: 'Diana Miller', date: '2024-07-02', amount: 100, method: 'Paybill' },
  { id: 'CON004', memberId: 'MEM005', memberName: 'Ethan Davis', date: '2024-07-03', amount: 100, method: 'Paybill' },
  { id: 'CON005', memberId: 'MEM006', memberName: 'Fiona Garcia', date: '2024-07-03', amount: 100, method: 'Paybill' },
  { id: 'CON006', memberId: 'MEM001', memberName: 'Alice Johnson', date: '2024-06-01', amount: 100, method: 'Paybill' },
  { id: 'CON007', memberId: 'MEM002', memberName: 'Bob Williams', date: '2024-06-02', amount: 100, method: 'Paybill' },
  { id: 'CON008', memberId: 'MEM001', memberName: 'Alice Johnson', date: '2024-05-01', amount: 100, method: 'Paybill' },
  { id: 'CON009', memberId: 'MEM002', memberName: 'Bob Williams', date: '2024-05-01', amount: 100, method: 'Paybill' },
  { id: 'CON010', memberId: 'MEM004', memberName: 'Diana Miller', date: '2024-06-01', amount: 100, method: 'Paybill' },
  { id: 'CON011', memberId: 'MEM005', memberName: 'Ethan Davis', date: '2024-06-01', amount: 150, method: 'Paybill' },
  { id: 'CON012', memberId: 'MEM006', memberName: 'Fiona Garcia', date: '2024-06-01', amount: 100, method: 'Paybill' },
];

export const welfareRequests: WelfareRequest[] = [
  { id: 'WEL001', memberId: 'MEM001', memberName: 'Alice Johnson', requestDate: '2024-06-15', amount: 500, reason: 'Medical Emergency', status: 'Approved' },
  { id: 'WEL002', memberId: 'MEM002', memberName: 'Bob Williams', requestDate: '2024-06-20', amount: 1000, reason: 'Education Fund', status: 'Disbursed' },
  { id: 'WEL003', memberId: 'MEM004', memberName: 'Diana Miller', requestDate: '2024-07-05', amount: 750, reason: 'Home Repair', status: 'Pending' },
  { id: 'WEL004', memberId: 'MEM005', memberName: 'Ethan Davis', requestDate: '2024-07-10', amount: 200, reason: 'Family Support', status: 'Rejected' },
];
