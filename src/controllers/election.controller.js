const electionUseCase = require('../usecases/election.usecase');

class ElectionController {
    async create(req, res) {
        try {
            const result = await electionUseCase.createElection(req.body);
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
}

module.exports = new ElectionController();
