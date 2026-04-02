// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    address public owner;

    // Struct to represent a voter
    struct Voter {
        bool hasVoted;
        uint candidateId;
    }

    // Maps election ID -> voter address -> Voter struct
    mapping(uint => mapping(address => Voter)) public votes;

    // Event emitted when a vote is cast
    event VoteCast(address indexed voter, uint candidateId, uint indexed electionId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Casts a vote for a candidate in a specific election
     * @param electionId ID of the election
     * @param candidateId ID of the candidate being voted for
     */
    function castVote(uint electionId, uint candidateId) public {
        require(!votes[electionId][msg.sender].hasVoted, "Voter has already cast a vote for this election");

        votes[electionId][msg.sender] = Voter({
            hasVoted: true,
            candidateId: candidateId
        });

        emit VoteCast(msg.sender, candidateId, electionId);
    }

    /**
     * @dev Checks if an address has voted in a specific election
     * @param electionId ID of the election
     * @param voter Address of the voter
     * @return bool True if voter has voted, false otherwise
     */
    function hasVoted(uint electionId, address voter) public view returns (bool) {
        return votes[electionId][voter].hasVoted;
    }
}
