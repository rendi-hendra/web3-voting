const prisma = require('../infrastructure/prisma');

class ElectionRepository {
    async create(data) {
        return await prisma.election.create({
            data: {
                title: data.title,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                isActive: true,
                candidates: {
                    create: data.candidates.map(candidate => ({
                        name: candidate.name,
                        vision: candidate.vision,
                        mission: candidate.mission,
                    }))
                }
            },
            include: { candidates: true }
        });
    }

    async findAll() {
        return await prisma.election.findMany({
            include: { candidates: true }
        });
    }

    async findById(id) {
        return await prisma.election.findUnique({
            where: { id: parseInt(id) },
            include: { 
                candidates: {
                    include: {
                        _count: {
                            select: { votes: true }
                        }
                    }
                },
                votes: {
                    include: {
                        voter: true,
                        candidate: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                }
            }
        });
    }
}

module.exports = new ElectionRepository();
