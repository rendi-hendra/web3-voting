const electionUseCase = require('../usecases/election.usecase');

class ElectionController {
    async create(req, res) {
        try {
            const result = await electionUseCase.createElection(req.body);
            
            // Emit real-time update
            if (req.io) {
                req.io.emit('electionCreated', result);
            }

            res.status(201).json({
                success: true,
                message: 'Election created successfully',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
                errors: error.errors
            });
        }
    }

    async index(req, res) {
        try {
            const results = await electionUseCase.getAllElections();
            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async show(req, res) {
        try {
            const result = await electionUseCase.getElectionById(req.params.id);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Election not found'
                });
            }
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async vote(req, res) {
        try {
            const { candidateId, voterId } = req.body;
            const electionId = req.params.id;

            // 1. Basic Validation
            if (!voterId) {
                return res.status(400).json({ success: false, message: 'Voter ID is required' });
            }

            // 2. Check if already voted in Database
            const prisma = require('../infrastructure/prisma');
            const existingVote = await prisma.vote.findUnique({
                where: {
                    voterId_electionId: {
                        voterId: parseInt(voterId),
                        electionId: parseInt(electionId)
                    }
                }
            });

            if (existingVote) {
                return res.status(400).json({ success: false, message: 'You have already cast a vote for this election' });
            }

            const txHash = await electionUseCase.castVote(electionId, candidateId);
            
            res.json({
                success: true,
                message: 'Vote cast successfully via Blockchain',
                txHash
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ElectionController();
