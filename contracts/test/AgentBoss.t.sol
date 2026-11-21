// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/AgentBossMarketplace.sol";

contract AgentBossTest is Test {
    AgentBossMarketplace market;

    address provider = address(0xBEEF);
    address buyer = address(0xCAFE);

    uint256 constant PRICE = 10 ether;

    function setUp() public {
        market = new AgentBossMarketplace();

        vm.deal(provider, 0);
        vm.deal(buyer, 100 ether);
        vm.prank(provider);
        market.registerService("Data Analysis Agent", "Analyzes spreadsheets and returns charts", PRICE);
    }

    function testPurchaseSplitsExact() public {
        vm.prank(buyer);
        market.purchaseService{value: PRICE}(1);

        // 80% to provider, 10% fuel, 10% treasury.
        assertEq(provider.balance, 8 ether);
        assertEq(market.fuelPool(), 1 ether);
        assertEq(market.treasury(), 1 ether);
        // Marketplace holds exactly the two pools (no dust, no overpayment kept).
        assertEq(address(market).balance, 2 ether);

        (uint256 fuel, uint256 treasuryAmount, uint256 paid) = market.getPools();
        assertEq(fuel, 1 ether);
        assertEq(treasuryAmount, 1 ether);
        assertEq(paid, PRICE);
        assertEq(market.totalPaid(), PRICE);
    }

    function testPurchaseRefundsOverpayment() public {
        vm.prank(buyer);
        market.purchaseService{value: PRICE + 5 ether}(1);

        assertEq(provider.balance, 8 ether);
        assertEq(market.fuelPool(), 1 ether);
        assertEq(market.treasury(), 1 ether);
        // Buyer got the 5 ether overpayment back.
        assertEq(buyer.balance, 100 ether - PRICE);
    }

    function testTwoPurchasesAccumulatePools() public {
        vm.prank(buyer);
        market.purchaseService{value: PRICE}(1);
        vm.prank(buyer);
        market.purchaseService{value: PRICE}(1);

        assertEq(provider.balance, 16 ether);
        assertEq(market.fuelPool(), 2 ether);
        assertEq(market.treasury(), 2 ether);
        assertEq(market.totalPaid(), 2 * PRICE);
        assertEq(address(market).balance, 4 ether);
    }

    function testRatingAfterPurchase() public {
        vm.prank(buyer);
        market.purchaseService{value: PRICE}(1);

        vm.prank(buyer);
        market.submitRating(1, 5, "Fast and accurate, would hire again");

        assertEq(market.getAverageRating(1), 50); // 5.0 stars * 10
        AgentBossMarketplace.Rating[] memory ratings = market.getServiceRatings(1);
        assertEq(ratings.length, 1);
        assertEq(ratings[0].stars, 5);
        assertEq(ratings[0].rater, buyer);
    }

    function testRatingRequiresPurchase() public {
        vm.prank(buyer);
        vm.expectRevert("Must purchase service to rate");
        market.submitRating(1, 5, "no purchase yet");
    }

    function testAverageRatingZeroWithoutRatings() public view {
        assertEq(market.getAverageRating(1), 0);
    }

    function testSecondPurchaseAndRatingAverages() public {
        address buyer2 = address(0xD00D);
        vm.deal(buyer2, 100 ether);

        vm.prank(buyer);
        market.purchaseService{value: PRICE}(1);
        vm.prank(buyer);
        market.submitRating(1, 5, "great");

        vm.prank(buyer2);
        market.purchaseService{value: PRICE}(1);
        vm.prank(buyer2);
        market.submitRating(1, 3, "ok");

        // (5 + 3) / 2 = 4.0 -> 40
        assertEq(market.getAverageRating(1), 40);
    }
}
