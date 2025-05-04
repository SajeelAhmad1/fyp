import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth-options';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({
                success: true,
                count: 0
            });
        }

        const count = await prisma.order.count({ 
            where: { userId: session.user.id }
        });

        return NextResponse.json({
            success: true,
            count
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}