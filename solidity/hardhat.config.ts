import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: {
    version: "0.8.28",
  },
  networks: {
    // hardhat: {
    //   type: "edr-simulated",
    //   mining: {
    //     auto: false,
    //     interval: 10000,
    //   },
    // },

    // arbitrumSepolia: {
    //   type: "http",
    //   chainType: "generic",
    //   chainId: 421614,
    //   url: process.env.ARBITRUM_SEPOLIA_RPC!,
    //   accounts: [process.env.PRIVATE_KEY!],
    // },

    arbitrum: {
      type: "http",
      chainType: "generic",
      chainId: 42161,
      url: process.env.ARBITRUM_RPC!,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
});
