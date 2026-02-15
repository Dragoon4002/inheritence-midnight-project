import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@/modules/midnight/wallet-widget/hooks/useWallet";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { createUnprovenCallTx, findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { Contract, ledger, type Ledger } from "@eddalabs/inheritance-contract/contract";

const CONTRACT_ADDRESS = import.meta.env.VITE_INHERITANCE_CONTRACT_ADDRESS;
const ZK_CONFIG_PATH = "/midnight/inheritance"; // Path to ZK artifacts served by Vite

export interface ContractState {
  isRegistered: boolean;
  isExecuted: boolean;
  parent: string;
  child: string;
}

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

export const useInheritanceContract = () => {
  const { connectedAPI, serviceUriConfig, shieldedAddresses } = useWallet();
  const [contractState, setContractState] = useState<ContractState>({
    isRegistered: false,
    isExecuted: false,
    parent: "",
    child: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("disconnected");
  const publicDataProviderRef = useRef<any>(null);

  // Read ledger state from indexer
  const refreshState = useCallback(async () => {
    if (!publicDataProviderRef.current || !CONTRACT_ADDRESS) return;

    try {
      const state = await publicDataProviderRef.current.queryContractState(CONTRACT_ADDRESS);
      if (state) {
        const l: Ledger = ledger(state.data);
        setContractState({
          isRegistered: l.isRegistered,
          isExecuted: l.isExecuted,
          parent: bytesToHex(l.parent),
          child: bytesToHex(l.child),
        });
      }
    } catch (err) {
      console.error("Failed to read contract state:", err);
    }
  }, []);

  // Setup connection when wallet connects
  const setupContract = useCallback(async () => {
    if (!serviceUriConfig || !CONTRACT_ADDRESS) {
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");
    setError(null);

    try {
      const publicDataProvider = indexerPublicDataProvider(
        serviceUriConfig.indexerUri,
        serviceUriConfig.indexerWsUri
      );

      publicDataProviderRef.current = publicDataProvider;

      // Read initial state
      await refreshState();
      setStatus("connected");
    } catch (err: any) {
      console.error("Failed to setup contract:", err);
      setError(err.message || "Failed to connect to contract");
      setStatus("error");
    }
  }, [serviceUriConfig, refreshState]);

  // Helper to call circuit and submit via dapp-connector
  const callCircuit = useCallback(
    async <T extends "register" | "execute">(
      circuitId: T,
      args: T extends "register" ? [Uint8Array, Uint8Array] : []
    ) => {
      if (!connectedAPI || !serviceUriConfig || !shieldedAddresses || !publicDataProviderRef.current) {
        throw new Error("Wallet or contract not connected");
      }

      // Create compiled contract reference
      const compiledContract = CompiledContract.make("inheritance", Contract).pipe(
        CompiledContract.withVacantWitnesses
      );

      // Create ZK config provider for browser (fetches from served assets)
      const zkConfigProvider = new FetchZkConfigProvider(
        window.location.origin,
        ZK_CONFIG_PATH
      );

      // Create minimal wallet provider with coin/encryption keys
      const walletProvider = {
        getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
        getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
        // balanceTx won't be called - we use dapp-connector instead
        balanceTx: async () => {
          throw new Error("Use dapp-connector for balancing");
        },
      };

      // Create unproven call transaction
      const callTxData = await createUnprovenCallTx(
        {
          zkConfigProvider,
          publicDataProvider: publicDataProviderRef.current,
          walletProvider,
        },
        {
          compiledContract,
          circuitId,
          contractAddress: CONTRACT_ADDRESS,
          ...(args.length > 0 ? { args } : {}),
        } as any
      );

      // Use dapp-connector to balance, prove, and submit
      const provedTx = await (connectedAPI as any).balanceAndProveTransaction(
        callTxData.private.unprovenTx,
        callTxData.private.newCoins
      );

      const txId = await (connectedAPI as any).submitTransaction(provedTx);

      // Wait for transaction to finalize
      await publicDataProviderRef.current.watchForTxData(txId);

      // Refresh state after successful transaction
      await refreshState();

      return true;
    },
    [connectedAPI, serviceUriConfig, shieldedAddresses, refreshState]
  );

  // Register inheritance
  const register = useCallback(
    async (parentAddr: string, childAddr: string) => {
      if (!connectedAPI) {
        setError("Wallet not connected");
        return false;
      }

      setLoading(true);
      setError(null);
      setStatus("registering");

      try {
        // Convert hex addresses to Uint8Array (32 bytes)
        const parentBytes = hexToBytes(parentAddr);
        const childBytes = hexToBytes(childAddr);

        if (parentBytes.length !== 32 || childBytes.length !== 32) {
          throw new Error("Addresses must be 64 character hex strings (32 bytes)");
        }

        await callCircuit("register", [parentBytes, childBytes]);
        setStatus("connected");
        return true;
      } catch (err: any) {
        console.error("Register failed:", err);
        setError(err.message || "Registration failed");
        setStatus("error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [connectedAPI, callCircuit]
  );

  // Execute inheritance
  const execute = useCallback(async () => {
    if (!connectedAPI) {
      setError("Wallet not connected");
      return false;
    }

    setLoading(true);
    setError(null);
    setStatus("executing");

    try {
      await callCircuit("execute", []);
      setStatus("connected");
      return true;
    } catch (err: any) {
      console.error("Execute failed:", err);
      setError(err.message || "Execution failed");
      setStatus("error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [connectedAPI, callCircuit]);

  // Auto-setup when wallet connects
  useEffect(() => {
    if (serviceUriConfig) {
      setupContract();
    }
  }, [serviceUriConfig, setupContract]);

  return {
    contractState,
    loading,
    error,
    status,
    isConnected: status === "connected",
    register,
    execute,
    refreshState,
    setupContract,
  };
};
