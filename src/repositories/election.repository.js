const prisma = require('../infrastructure/prisma');

class ElectionRepository {
    async create(data) {
        return await prisma.election.create({
            data: {
                title: data.title,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                isActive: true
            }
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
            include: { candidates: true }
        });
    }
}

module.exports = new ElectionRepository();
