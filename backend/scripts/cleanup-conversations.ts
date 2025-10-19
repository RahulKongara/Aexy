import prisma from '../src/db/prisma';

async function cleanupStaleConversations() {
    console.log('🧹 Cleaning up stale conversations...');

    try {
        // Find all conversations that haven't ended
        const activeConvos = await prisma.conversation.findMany({
            where: {
                endTime: null,
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        console.log(`Found ${activeConvos.length} active conversations`);

        if (activeConvos.length === 0) {
            console.log('✅ No stale conversations to clean up');
            return;
        }

        // Show the conversations
        activeConvos.forEach((convo) => {
            console.log(`  - ID: ${convo.id}, User: ${convo.user.email}, Scenario: ${convo.scenario || 'none'}, Started: ${convo.startTime}`);
        });

        // End all stale conversations
        const result = await prisma.conversation.updateMany({
            where: {
                endTime: null,
            },
            data: {
                endTime: new Date(),
                summary: 'Auto-closed by cleanup script',
            },
        });

        console.log(`✅ Cleaned up ${result.count} stale conversations`);
    } catch (error) {
        console.error('❌ Error cleaning up conversations:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupStaleConversations();
