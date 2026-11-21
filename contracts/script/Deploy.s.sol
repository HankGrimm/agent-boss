// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AgentBossMarketplace.sol";

/// @notice Deploys AgentBossMarketplace only. Everything is MON — there is no
/// separate platform token, so nothing else to deploy.
/// @dev Run against Monad testnet with:
///   forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz \
///     --chain-id 10143 --private-key $PRIVATE_KEY --broadcast
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        AgentBossMarketplace market = new AgentBossMarketplace();

        vm.stopBroadcast();

        console.log("AgentBossMarketplace deployed at:", address(market));
    }
}
