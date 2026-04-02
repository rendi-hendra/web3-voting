const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Placeholder values for the environment variables
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

let provider;
let wallet;
let votingContract;

try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    
    if (PRIVATE_KEY) {
        wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    }

    if (CONTRACT_ADDRESS) {
        // Load ABI dynamically from Hardhat artifacts
        const artifactPath = path.resolve(__dirname, '../../artifacts/contracts/Voting.sol/Voting.json');
        if (fs.existsSync(artifactPath)) {
            const VotingArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
            
            // Connect with wallet if available, otherwise just provider (read-only)
            const signerOrProvider = wallet || provider;
            votingContract = new ethers.Contract(CONTRACT_ADDRESS, VotingArtifact.abi, signerOrProvider);
            
            console.log("Web3: Connected to Voting Contract at", CONTRACT_ADDRESS);
        } else {
            console.warn("Web3: Voting contract artifacts not found. Please compile the contract.");
        }
    } else {
        console.warn("Web3: CONTRACT_ADDRESS is not set in .env.");
    }
} catch (error) {
    console.error("Web3 Initialization Error:", error);
}

module.exports = {
    provider,
    wallet,
    votingContract
};
