
'use server';
import { getDb } from './db';
import type { Member, Contribution, WelfareRequest } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { randomUUID } from 'crypto';

export async function getMembers(): Promise<Member[]> {
    const db = await getDb();
    return db.all('SELECT * FROM members ORDER BY name');
}

export async function getContributions(): Promise<Contribution[]> {
    const db = await getDb();
    const contributions = await db.all<Contribution[]>('SELECT * FROM contributions ORDER BY date DESC');
    return contributions.map(c => ({...c, isAnomalous: !!c.isAnomalous}));
}

export async function getWelfareRequests(): Promise<WelfareRequest[]> {
    const db = await getDb();
    return db.all('SELECT * FROM welfare_requests ORDER BY requestDate DESC');
}

export async function getMember(id: string): Promise<Member | undefined> {
    const db = await getDb();
    return db.get('SELECT * FROM members WHERE id = ?', id);
}

export async function getContributionsForMember(memberId: string): Promise<Contribution[]> {
    const db = await getDb();
    const contributions = await db.all<Contribution[]>('SELECT * FROM contributions WHERE memberId = ? ORDER BY date DESC', memberId);
    return contributions.map(c => ({...c, isAnomalous: !!c.isAnomalous}));
}

export async function getDashboardData() {
    const members = await getMembers();
    const contributions = await getContributions();
    const welfareRequests = await getWelfareRequests();
    return { members, contributions, welfareRequests };
}

export async function addMember(memberData: {name: string, email: string}) {
    const db = await getDb();
    const id = `MEM${randomUUID()}`;
    const allMembers = await getMembers();
    const memberSince = new Date().toISOString().split('T')[0];
    const avatarUrl = PlaceHolderImages[allMembers.length % 6].imageUrl;

    await db.run(
        'INSERT INTO members (id, name, email, memberSince, avatarUrl, status) VALUES (?, ?, ?, ?, ?, ?)',
        id,
        memberData.name,
        memberData.email,
        memberSince,
        avatarUrl,
        'active'
    );
    const newMember = await getMember(id);
    if (!newMember) throw new Error("Failed to create and retrieve new member");
    return newMember;
}

export async function addContribution(contributionData: {memberId: string, amount: number, date: string, isAnomalous?: boolean, anomalyReason?: string}) {
    const db = await getDb();
    const member = await getMember(contributionData.memberId);
    if (!member) throw new Error('Member not found');

    const id = `CON${randomUUID()}`;
    const contributions = await getContributions();
    const method = contributions.length % 2 === 0 ? 'Paybill' : 'Bank Transfer';

    await db.run(
        'INSERT INTO contributions (id, memberId, memberName, date, amount, method, isAnomalous, anomalyReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        id,
        contributionData.memberId,
        member.name,
        contributionData.date,
        contributionData.amount,
        method,
        contributionData.isAnomalous ?? false,
        contributionData.anomalyReason ?? null
    );
}
