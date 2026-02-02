
'use server';
import prisma from './prisma';
import type { Member, Contribution, WelfareRequest } from './types';
import { PlaceHolderImages } from './placeholder-images';
import type { User as NextAuthUser } from 'next-auth';

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


export async function getMembers({ query }: { query?: string } = {}): Promise<Member[]> {
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

export async function getContributions({ query, memberId }: { query?: string; memberId?: string; } = {}): Promise<Contribution[]> {
    let where: any = {};
    if (query) {
        where.OR = [
            { memberName: { contains: query, mode: 'insensitive' } },
            { method: { contains: query, mode: 'insensitive' } },
        ]
    }
    if (memberId) {
        where.memberId = memberId;
    }

    const contributions = await prisma.contribution.findMany({
        where,
        orderBy: { date: 'desc' },
    });
    return contributions.map(serializeContribution);
}

export async function getWelfareRequests({ query, memberId }: { query?: string; memberId?: string; } = {}): Promise<WelfareRequest[]> {
    const where: any = {};
    if (query) {
        where.OR = [
            { memberName: { contains: query, mode: 'insensitive' } },
            { reason: { contains: query, mode: 'insensitive' } },
        ];
    }
    if (memberId) {
        where.memberId = memberId;
    }
    const requests = await prisma.welfareRequest.findMany({
        where,
        orderBy: { requestDate: 'desc' },
    });
    return requests.map(serializeWelfareRequest);
}

export async function getMember(id: string): Promise<Member | null> {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return null;
    return serializeMember(member);
}

export async function getMemberByUserId(userId: string): Promise<Member | null> {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) return null;
    return serializeMember(member);
}


export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
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

export async function getDashboardData(memberId?: string) {
    if (memberId) {
        const member = await getMember(memberId);
        const contributions = await getContributionsForMember(memberId);
        const welfareRequests = await getWelfareRequestsForMember(memberId);
        return { members: member ? [member] : [], contributions, welfareRequests };
    }

    const members = await getMembers();
    const contributions = await getContributions();
    const welfareRequests = await getWelfareRequests();
    return { members, contributions, welfareRequests };
}


export async function createUserAndMember(userData: {name: string, email: string, password?: string, image?: string}) {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                image: userData.image,
            }
        });

        await createMemberForUser(user, tx);

        return user;
    });
}

export async function createMemberForUser(user: NextAuthUser, tx?: any) {
    const prismaTx = tx || prisma;
    if (!user.id || !user.name || !user.email) {
        throw new Error("User object is missing required fields (id, name, email).");
    }

    const allMembersCount = await prismaTx.member.count();
    const avatarUrl = user.image || PlaceHolderImages[allMembersCount % PlaceHolderImages.length].imageUrl;

    const member = await prismaTx.member.findUnique({ where: { userId: user.id }});

    if (!member) {
        return await prismaTx.member.create({
            data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatarUrl,
                status: 'active',
            },
        });
    }
    return member;
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

        await tx.user.update({
            where: { id: member.userId },
            data: {
                name: memberData.name,
                email: memberData.email,
            }
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

export async function deleteMember(memberId: string) {
    const member = await prisma.member.findUnique({ where: { id: memberId }});
    if (!member) {
        throw new Error('Member not found');
    }
    // The schema is set to cascade delete, so deleting the user will delete the member, accounts, sessions, etc.
    return await prisma.user.delete({ where: { id: member.userId } });
}

export async function addContribution(contributionData: {memberId: string, amount: number, date: string, isAnomalous?: boolean, anomalyReason?: string}) {
    const member = await prisma.member.findUnique({ where: { id: contributionData.memberId }});
    if (!member) throw new Error('Member not found');

    const contributionsCount = await prisma.contribution.count();
    const method = contributionsCount % 2 === 0 ? 'Paybill' : 'Bank Transfer';

    await prisma.contribution.create({
        data: {
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
    
    const newRequest = await prisma.welfareRequest.create({
        data: {
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
