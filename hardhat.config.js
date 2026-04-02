require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    ganache: {
      url: "http://127.0.0.1:7545", // Custom Ganache UI port
    }
  },
};
