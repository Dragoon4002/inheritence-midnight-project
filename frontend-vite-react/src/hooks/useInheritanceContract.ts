import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@/modules/midnight/wallet-widget/hooks/useWallet";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { ledger, type Ledger } from "@eddalabs/inheritance-contract/contract";

const CONTRACT_ADDRESS = import.meta.env.VITE_INHERITANCE_CONTRACT_ADDRESS;

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

export const useInheritanceContract = () => {
  const { connectedAPI, serviceUriConfig } = useWallet();
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

  // Register inheritance (mocked - real implementation needs full wallet provider)
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
        // TODO: Implement actual contract call with proper wallet provider
        // For now, simulate - this would need balanceTx/submitTx from wallet
        setError("Transaction calls require full wallet integration (coming soon)");
        setStatus("connected");
        return false;
      } catch (err: any) {
        console.error("Register failed:", err);
        setError(err.message || "Registration failed");
        setStatus("error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [connectedAPI]
  );

  // Execute inheritance (mocked)
  const execute = useCallback(async () => {
    if (!connectedAPI) {
      setError("Wallet not connected");
      return false;
    }

    setLoading(true);
    setError(null);
    setStatus("executing");

    try {
      // TODO: Implement actual contract call
      setError("Transaction calls require full wallet integration (coming soon)");
      setStatus("connected");
      return false;
    } catch (err: any) {
      console.error("Execute failed:", err);
      setError(err.message || "Execution failed");
      setStatus("error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [connectedAPI]);

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
