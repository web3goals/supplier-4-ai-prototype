import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const accounts = [];
if (process.env.PRIVATE_KEY_1) {
  accounts.push(process.env.PRIVATE_KEY_1);
}
if (process.env.PRIVATE_KEY_2) {
  accounts.push(process.env.PRIVATE_KEY_2);
}

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    polygonMumbai: {
      url: process.env.RPC_URL_POLYGON_MUMBAI || "",
      accounts: accounts,
    },
    lineaTestnet: {
      url: process.env.RPC_URL_LINEA_TESTNET || "",
      accounts: accounts,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.ETHERSCAN_API_KEY_POLYGON_MUMBAI || "",
    },
  },
};

export default config;
