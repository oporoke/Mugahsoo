export interface Member {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  avatarUrl: string;
  status: 'active' | 'inactive';
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  amount: number;
  method: 'Paybill' | 'Bank Transfer';
  isAnomalous?: boolean;
  anomalyReason?: string;
}

export interface WelfareRequest {
  id: string;
  memberId: string;
  memberName: string;
  requestDate: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed';
}
