
'use server';
import prisma from './prisma';
import type { Member, Contribution, WelfareRequest } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { randomUUID } from 'crypto';

// Helper to convert Prisma's Date objects to strings for serializing to client components
const serializeMember = (member: any): Member => ({
    ...member,
    memberSince: member.memberSince.toISOString(),
});

const serializeContribution = (c: any): Contribution => ({
    ...c,
    date: c.date.toISOString(),
    isAnomalous: !!c.isAnomalous, // Ensure boolean
});

const serializeWelfareRequest = (r: any): WelfareRequest => ({
    ...r,
    requestDate: r.requestDate.toISOString(),
});


export async function getMembers(query?: string): Promise<Member[]> {
    const where = query
        ? {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { id: { contains: query, mode: 'insensitive' } },
            ],
        }
        : {};

    const members = await prisma.member.findMany({
        where,
        orderBy: { name: 'asc' },
    });
    return members.map(serializeMember);
}

export async function getContributions(query?: string): Promise<Contribution[]> {
    const where = query
        ? { memberName: { contains: query, mode: 'insensitive' } }
        : {};
    const contributions = await prisma.contribution.findMany({
        where,
        orderBy: { date: 'desc' },
    });
    return contributions.map(serializeContribution);
}

export async function getWelfareRequests(): Promise<WelfareRequest[]> {
    const requests = await prisma.welfareRequest.findMany({
        orderBy: { requestDate: 'desc' },
    });
    return requests.map(serializeWelfareRequest);
}

export async function getMember(id: string): Promise<Member | null> {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return null;
    return serializeMember(member);
}

export async function getContributionsForMember(memberId: string): Promise<Contribution[]> {
    const contributions = await prisma.contribution.findMany({
        where: { memberId },
        orderBy: { date: 'desc' },
    });
    return contributions.map(serializeContribution);
}

export async function getWelfareRequestsForMember(memberId: string): Promise<WelfareRequest[]> {
    const requests = await prisma.welfareRequest.findMany({
        where: { memberId },
        orderBy: { requestDate: 'desc' },
    });
    return requests.map(serializeWelfareRequest);
}

export async function getDashboardData() {
    const members = await getMembers();
    const contributions = await getContributions();
    const welfareRequests = await getWelfareRequests();
    return { members, contributions, welfareRequests };
}

export async function addMember(memberData: {name: string, email: string}) {
    const id = `MEM${randomUUID()}`;
    const allMembersCount = await prisma.member.count();
    const avatarUrl = PlaceHolderImages[allMembersCount % PlaceHolderImages.length].imageUrl;

    const newMember = await prisma.member.create({
        data: {
            id,
            name: memberData.name,
            email: memberData.email,
            avatarUrl,
            status: 'active',
        },
    });
    return serializeMember(newMember);
}

export async function updateMember(id: string, memberData: { name: string, email: string, status: 'active' | 'inactive' }) {
    const updatedMember = await prisma.$transaction(async (tx) => {
        const member = await tx.member.update({
            where: { id },
            data: {
                name: memberData.name,
                email: memberData.email,
                status: memberData.status,
            },
        });

        await tx.contribution.updateMany({
            where: { memberId: id },
            data: { memberName: memberData.name },
        });
        
        await tx.welfareRequest.updateMany({
            where: { memberId: id },
            data: { memberName: memberData.name },
        });

        return member;
    });

    return serializeMember(updatedMember);
}

export async function deleteMember(id: string) {
    return await prisma.member.delete({ where: { id } });
}

export async function addContribution(contributionData: {memberId: string, amount: number, date: string, isAnomalous?: boolean, anomalyReason?: string}) {
    const member = await prisma.member.findUnique({ where: { id: contributionData.memberId }});
    if (!member) throw new Error('Member not found');

    const id = `CON${randomUUID()}`;
    const contributionsCount = await prisma.contribution.count();
    const method = contributionsCount % 2 === 0 ? 'Paybill' : 'Bank Transfer';

    await prisma.contribution.create({
        data: {
            id,
            memberId: contributionData.memberId,
            memberName: member.name,
            date: new Date(contributionData.date),
            amount: contributionData.amount,
            method,
            isAnomalous: contributionData.isAnomalous ?? false,
            anomalyReason: contributionData.anomalyReason,
        }
    });
}

export async function addWelfareRequest(requestData: { memberId: string, amount: number, reason: string }) {
    const member = await prisma.member.findUnique({ where: { id: requestData.memberId }});
    if (!member) throw new Error('Member not found');

    const id = `WLF${randomUUID()}`;
    
    const newRequest = await prisma.welfareRequest.create({
        data: {
            id,
            memberId: requestData.memberId,
            memberName: member.name,
            amount: requestData.amount,
            reason: requestData.reason,
            status: 'Pending',
        }
    });
    return serializeWelfareRequest(newRequest);
}

export async function updateWelfareRequestStatus(id: string, status: WelfareRequest['status']) {
    const updatedRequest = await prisma.welfareRequest.update({
        where: { id },
        data: { status },
    });
    return serializeWelfareRequest(updatedRequest);
}
