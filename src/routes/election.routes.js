const express = require('express');
const router = express.Router();
const electionController = require('../controllers/election.controller');

router.post('/', electionController.create);
router.get('/', electionController.index);
router.get('/:id', electionController.show);

module.exports = router;
