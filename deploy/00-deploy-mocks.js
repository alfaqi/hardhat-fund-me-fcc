const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

/** Or we can define them in helper-hardhat-config file */
// const DECIMALS = 8;
// const INITIAL_ANSWER = 200000000000;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  //   if (chainId == 31337) {
  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER],
      log: true,
    });
    log("Mocks Deployed!");
    log("------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
