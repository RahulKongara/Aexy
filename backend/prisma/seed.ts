import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const main = async () => {
    console.log('Seeding DB.');

    const passHash = await bcrypt.hash('password123', 10);

    const freeUser = await prisma.user.upsert({
        where: { email: 'free@test.com' },
        update: {},
        create: {
            email: 'free@test.com',
            password: passHash,
            tier: 'FREE',
        },
    });

    const standardUser = await prisma.user.upsert({
        where: { email: 'standard@test.com' },
        update: {},
        create: {
            email: 'standard@test.com',
            password: passHash,
            tier: 'STANDARD',
        },
    });

    const premiumUser = await prisma.user.upsert({
        where: { email: 'premium@test.com' },
        update: {},
        create: {
            email: 'premium@test.com',
            password: passHash,
            tier: 'PREMIUM',
        },
    });

    await prisma.dailyUsage.upsert({
        where: {
            userId_date: {
                userId: freeUser.id, 
                date: new Date(),
            },
        },
        update: {},
        create: {
            userId: freeUser.id,
            date: new Date(),
            conversationsCt: 1,
        },
    });

    await prisma.subscription.upsert({
        where: { id: standardUser.id },
        update: {},
        create: {
            userId: standardUser.id,
            tier: 'STANDARD',
            status: 'active',
        },
    });

    await prisma.subscription.upsert({
        where: { id: premiumUser.id },
        update: {},
        create: {
            userId: premiumUser.id,
            tier: 'PREMIUM',
            status: 'active',
        },
    });

    console.log('DB seeded successfully');
    console.log("Test Users:");
    console.log('   - free@test.com');
    console.log('   - standard@test.com');
    console.log('   - Password for all: password123');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});