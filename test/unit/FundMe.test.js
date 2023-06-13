const { deployments, ethers, network, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Fund Me", () => {
      let fundMe;
      let deployer,
        funders = 20;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        // const {deployer} = await getNamedAccounts()
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
        await fundMe.deployed();
      });

      describe("Constructor", () => {
        it("Deploy the contract", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("Other Functions", () => {
        it("Get Owner", async () => {
          const response = await fundMe.getOwner();
          assert.equal(response, deployer);
        });

        /** @dev This test case (testing receive and fallback functions ) dosen't go well
         * it throw an error
         * Error: invalid hexlify value (argument="value", value={"to":"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
         * "value":{"type":"BigNumber","hex":"0x016345785d8a0000"}}, code=INVALID_ARGUMENT, version=bytes/5.7.0)
         *
         */
        // it("should handle fallback function", async function () {
        //   // Call the contract's fallback function with a specific value
        //   const valueToSend = ethers.utils.parseEther("0.1");
        //   // const valueToSend = ethers.utils.parseUnits("1", "ether");

        //   const signer = await ethers.getSigner(deployer);
        //   const transaction = await fundMe.connect(signer).sendTransaction({
        //     value: valueToSend,
        //   });

        //   // Assert the expected behavior or state changes
        //   await expect(transaction)
        //     .to.emit(fundMe, "FallbackCalled")
        //     .withArgs(valueToSend);
        // });
      });

      describe("Fund Function", () => {
        it("Fails if you don't send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.reverted;
        });

        it("Updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const respnose = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(respnose.toString(), sendValue.toString());
        });

        it("Adds funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("Withdraw Function", () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single funder", async () => {
          /**
           * Arrange
           * Act
           * Assert
           */

          //
          /**
           * @dev Here we used fundMe insted of ethers
           * because we want getBalance function
           * no matter which provider provided to us
           */
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert
          assert.equal(endingFundMeBalance.toString(), 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Allows us to withdraw with multiple funders", async () => {
          // Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < funders; i++) {
            const newConnection = await fundMe.connect(accounts[i]);
            await newConnection.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance.toString(), 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make sure that the funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < funders; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        });
      });

      describe("Cheaper Withdraw", () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });
        it("Withdraw ETH from a single funder", async () => {
          /**
           * Arrange
           * Act
           * Assert
           */

          //
          /**
           * @dev Here we used fundMe insted of ethers
           * because we want getBalance function
           * no matter which provider comes on
           */
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Assert
          assert.equal(endingFundMeBalance.toString(), 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Allows us to withdraw with multiple funders", async () => {
          // Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < funders; i++) {
            const newConnection = await fundMe.connect(accounts[i]);
            await newConnection.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance.toString(), 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make sure that the funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < funders; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });
