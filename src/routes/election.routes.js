const express = require('express');
const router = express.Router();
const electionController = require('../controllers/election.controller');

router.get('/', electionController.index);
router.post('/', electionController.create);
router.get('/:id', electionController.show);
router.post('/:id/vote', electionController.vote);

module.exports = router;
