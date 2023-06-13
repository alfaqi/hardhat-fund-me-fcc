const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  log("Deploying...");
  const fundMe = await deploy("FundMe2", {
    from: deployer,
    args: [],
    log: true,
  });
  log(`Done! At: ${fundMe.address}`);
};
