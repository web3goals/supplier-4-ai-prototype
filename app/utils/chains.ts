import { Chain } from "wagmi/chains";
import { stringToAddress } from "./converters";

interface ChainConfig {
  chain: Chain;
  contractAddresses: {
    profile: string;
    dataSupplier: string;
  };
}

const mantleTestnet: Chain = {
  id: 5001,
  name: "Mantle Testnet",
  network: "mantle-testnet",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.mantle.xyz"],
      webSocket: ["wss://ws.testnet.mantle.xyz"],
    },
    public: {
      http: ["https://rpc.testnet.mantle.xyz"],
      webSocket: ["wss://ws.testnet.mantle.xyz"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Mantle Network Explorer",
      url: "https://explorer.testnet.mantle.xyz",
    },
    default: {
      name: "Mantle Network Explorer",
      url: "https://explorer.testnet.mantle.xyz",
    },
  },
  testnet: true,
};

/**
 * Get chain configs defined by environment variables.
 */
export function getSupportedChainConfigs(): ChainConfig[] {
  const chainConfigs: ChainConfig[] = [];
  if (
    process.env.NEXT_PUBLIC_MANTLE_TESTNET_PROFILE_CONTRACT_ADDRESS &&
    process.env.NEXT_PUBLIC_MANTLE_TESTNET_DATA_SUPPLIER_CONTRACT_ADDRESS
  ) {
    chainConfigs.push({
      chain: mantleTestnet,
      contractAddresses: {
        profile:
          process.env.NEXT_PUBLIC_MANTLE_TESTNET_PROFILE_CONTRACT_ADDRESS,
        dataSupplier:
          process.env.NEXT_PUBLIC_MANTLE_TESTNET_DATA_SUPPLIER_CONTRACT_ADDRESS,
      },
    });
  }
  return chainConfigs;
}

/**
 * Get chains using supported chain configs.
 */
export function getSupportedChains(): Chain[] {
  return getSupportedChainConfigs().map((chainConfig) => chainConfig.chain);
}

/**
 * Get the first chain config from supported chains.
 */
export function getDefaultSupportedChainConfig(): ChainConfig {
  const chainConfigs = getSupportedChainConfigs();
  if (chainConfigs.length === 0) {
    throw new Error("Supported chain config is not found");
  } else {
    return chainConfigs[0];
  }
}

/**
 * Return config of specified chain if it supported, otherwise return config of default supported chain.
 */
export function chainToSupportedChainConfig(
  chain: Chain | undefined
): ChainConfig {
  for (const config of getSupportedChainConfigs()) {
    if (config.chain.id === chain?.id) {
      return config;
    }
  }
  return getDefaultSupportedChainConfig();
}

/**
 * Return id of specified chain if it supported, otherwise return value from default supported chain.
 */
export function chainToSupportedChainId(
  chain: Chain | undefined
): number | undefined {
  return chainToSupportedChainConfig(chain).chain.id;
}

/**
 * Return native currency symbol of specified chain if it supported, otherwise return value from default supported chain.
 */
export function chainToSupportedChainNativeCurrencySymbol(
  chain: Chain | undefined
): string | undefined {
  return chainToSupportedChainConfig(chain).chain.nativeCurrency.symbol;
}

/**
 * Return profile contract address of specified chain if it supported, otherwise return value from default supported chain.
 */
export function chainToSupportedChainProfileContractAddress(
  chain: Chain | undefined
): `0x${string}` | undefined {
  return stringToAddress(
    chainToSupportedChainConfig(chain).contractAddresses.profile
  );
}

/**
 * Return supply contract address of specified chain if it supported, otherwise return value from default supported chain.
 */
export function chainToSupportedChainDataSupplierContractAddress(
  chain: Chain | undefined
): `0x${string}` | undefined {
  return stringToAddress(
    chainToSupportedChainConfig(chain).contractAddresses.dataSupplier
  );
}
