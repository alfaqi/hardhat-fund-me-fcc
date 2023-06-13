const networkConfig = {
  4: {
    name: "rinkby",
    ethUsdPriceFeed: "",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0xfE232d2b2C044BE30EE28DA39FFe74bfD4e3c323",
  },
  31337: {
    name: "hardhat",
    ethUsdPriceFeed: "10",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
