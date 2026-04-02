const electionRepository = require('../repositories/election.repository');
const { createElectionSchema } = require('../validations/election.validation');

class ElectionUseCase {
    async createElection(data) {
        const validatedData = createElectionSchema.parse(data);
        return await electionRepository.create(validatedData);
    }

    async getAllElections() {
        return await electionRepository.findAll();
    }

    async getElectionById(id) {
        return await electionRepository.findById(id);
    }
}

module.exports = new ElectionUseCase();
