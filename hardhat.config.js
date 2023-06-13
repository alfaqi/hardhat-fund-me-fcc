require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

require("@nomiclabs/hardhat-solhint");

require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_API_KEY = process.env.GOERLI_API_KEY || "http://eth-goerli";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      // accounts: Thanks hardhat!,
      chainId: 31337,
    },
  },
  solidity: {
    compilers: [{ version: "0.8.4" }, { version: "0.6.0" }],
  },

  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    // token: "MATIC",
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    players: {
      default: 1,
    },
  },
  ethercan: {
    apikey: ETHERSCAN_API_KEY,
  },
};
