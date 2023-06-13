// SPDX-License-Identifier: MIT
// Pragma
pragma solidity ^0.8;

// Imports

// Error Codes
error FundMe__NotOwner();

// Interfaces, Libraries, Contracts

/**
 * @title A contract for crowd funding
 * @author Patrick and Me
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feed as our library
 */
contract FundMe {
    // Type Declarations

    // State Variables
    uint256 public constant MINIMUM_USD = 0.01 * 10 ** 18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;

    address private immutable i_owner;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    /**
     * Functions Order:
     * Constructor
     * Receiver
     * Fallback
     * External
     * Public
     * Internal
     * Private
     * view / pure
     */

    constructor() {
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(msg.value >= MINIMUM_USD);
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        /**
         * withdrawing methods:
         * 1. Transfer: not use often
         * 2. Send: not use often
         * 3. Call: this is recommanded
         * */

        /* Transfer */
        // payable(msg.sender).transfer(address(this).balance);

        /* Send */
        // bool SendSuccess = payable(msg.sender).send(address(this).balance);
        // require(SendSuccess, "Send failed");

        /* Call */
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // mapping can't be in memory, sorry!
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool CallSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(CallSuccess, "Call failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 funderIndex) public view returns (address) {
        return s_funders[funderIndex];
    }

    function getAddressToAmountFunded(
        address funderAddress
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funderAddress];
    }
}
