const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    voting = await Voting.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });
  });

  describe("Voting Process", function () {
    it("Should allow a user to cast a vote", async function () {
      const electionId = 1;
      const candidateId = 10;

      // Cast vote
      await expect(voting.connect(addr1).castVote(electionId, candidateId))
        .to.emit(voting, "VoteCast")
        .withArgs(addr1.address, candidateId, electionId);

      // Verify vote was recorded
      expect(await voting.hasVoted(electionId, addr1.address)).to.equal(true);
    });

    it("Should prevent dual voting in the same election", async function () {
      const electionId = 1;
      const candidateId1 = 10;
      const candidateId2 = 11;

      // First vote should succeed
      await voting.connect(addr1).castVote(electionId, candidateId1);

      // Second vote by the same user in the same election should fail
      await expect(
        voting.connect(addr1).castVote(electionId, candidateId2)
      ).to.be.revertedWith("Voter has already cast a vote for this election");
    });

    it("Should allow the same user to vote in different elections", async function () {
      const electionId1 = 1;
      const electionId2 = 2;
      const candidateId = 10;

      // Vote in first election
      await voting.connect(addr1).castVote(electionId1, candidateId);
      
      // Vote in second election should also succeed
      await expect(voting.connect(addr1).castVote(electionId2, candidateId))
        .to.emit(voting, "VoteCast")
        .withArgs(addr1.address, candidateId, electionId2);
    });
  });
});
