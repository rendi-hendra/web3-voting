const hre = require("hardhat");

async function main() {
  console.log("Compiling contracts...");
  await hre.run('compile');

  console.log("Deploying Voting contract...");
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  const address = await voting.getAddress();

  console.log("Voting contract deployed to:", address);
  console.log("\nAction required:");
  console.log("Update the CONTRACT_ADDRESS in your .env file with:", address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
