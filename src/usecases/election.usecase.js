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

    async castVote(electionId, candidateId, voterAddress) {
        const { votingContract } = require('../infrastructure/ethers');
        if (!votingContract) throw new Error("Web3 Contract not initialized");

        // Execute transaction on blockchain
        const tx = await votingContract.castVote(electionId, candidateId);
        await tx.wait();
        return tx.hash;
    }
}

module.exports = new ElectionUseCase();
