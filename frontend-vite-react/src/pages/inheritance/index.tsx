import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Send, CheckCircle2, AlertCircle, Loader2, Wallet, RefreshCw } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useState, useEffect, useRef } from "react";
import { useInheritanceContract } from "@/hooks/useInheritanceContract";
import { useWallet } from "@/modules/midnight/wallet-widget/hooks/useWallet";

const CONTRACT_ADDRESS = import.meta.env.VITE_INHERITANCE_CONTRACT_ADDRESS;
const AUTO_EXECUTE_DELAY = 10; // seconds

export const Inheritance = () => {
  const { connectedAPI, setOpen: setWalletOpen, shieldedAddresses } = useWallet();
  const {
    contractState,
    loading,
    error,
    status,
    isConnected,
    register,
    execute,
    refreshState,
  } = useInheritanceContract();

  const [modalOpen, setModalOpen] = useState(false);
  const [childAddr, setChildAddr] = useState("");

  // Parent address is the connected wallet's shielded coin public key
  const parentAddr = shieldedAddresses?.shieldedCoinPublicKey || "";
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const truncateAddr = (addr: string) =>
    addr ? `${addr.slice(0, 8)}...${addr.slice(-8)}` : "";

  const handleRegister = async () => {
    if (!parentAddr || !childAddr) return;
    const success = await register(parentAddr, childAddr);
    if (success) {
      setModalOpen(false);
      setChildAddr("");
      startAutoExecute();
    }
  };

  const handleExecute = async () => {
    cancelAutoExecute();
    await execute();
  };

  const startAutoExecute = () => {
    setCountdown(AUTO_EXECUTE_DELAY);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(async () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(null);
      await execute();
    }, AUTO_EXECUTE_DELAY * 1000);
  };

  const cancelAutoExecute = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  };

  useEffect(() => {
    return () => cancelAutoExecute();
  }, []);

  // Start countdown if already registered but not executed
  useEffect(() => {
    if (contractState.isRegistered && !contractState.isExecuted && isConnected && countdown === null && !timerRef.current) {
      startAutoExecute();
    }
  }, [contractState.isRegistered, contractState.isExecuted, isConnected]);

  const getStatusText = () => {
    switch (status) {
      case "disconnected": return "Wallet not connected";
      case "connecting": return "Connecting to contract...";
      case "registering": return "Registering inheritance...";
      case "executing": return "Executing inheritance...";
      case "error": return error || "Error";
      case "connected": return "Connected";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-foreground mb-2">Inheritance Contract</h1>
            <p className="text-xl text-muted-foreground">Dead Man Switch - Manual Trigger</p>
          </div>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>

        {/* Contract Info */}
        <Card className="mb-4">
          <CardContent className="pt-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Contract Address</p>
              <p className="text-sm font-mono">{truncateAddr(CONTRACT_ADDRESS)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                isConnected ? "bg-green-500/20 text-green-500" :
                status === "error" ? "bg-red-500/20 text-red-500" :
                "bg-yellow-500/20 text-yellow-500"
              }`}>
                {getStatusText()}
              </span>
              {isConnected && (
                <Button variant="ghost" size="sm" onClick={() => refreshState()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection Prompt */}
        {!connectedAPI && (
          <Card className="mb-4 border-yellow-500/50">
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">Connect wallet to interact with contract</span>
              </div>
              <Button size="sm" onClick={() => setWalletOpen(true)}>
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-4 border-red-500/50">
            <CardContent className="pt-4">
              <p className="text-sm text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {loading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : contractState.isExecuted ? (
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              ) : contractState.isRegistered ? (
                <AlertCircle className="w-10 h-10 text-yellow-500" />
              ) : (
                <PlusCircle className="w-10 h-10 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">Inheritance Registry</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              {contractState.isExecuted
                ? "Inheritance executed - assets transferred"
                : contractState.isRegistered
                  ? countdown !== null
                    ? `Auto-executing in ${countdown}s...`
                    : "Ready to execute inheritance"
                  : "Register parent and child wallets"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Parent Wallet</p>
                    <p className="text-sm font-mono">
                      {contractState.parent ? truncateAddr(contractState.parent) : "Not set"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Child Wallet</p>
                    <p className="text-sm font-mono">
                      {contractState.child ? truncateAddr(contractState.child) : "Not set"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Registered</p>
                    <p className={`text-lg font-bold ${contractState.isRegistered ? "text-green-500" : "text-muted-foreground"}`}>
                      {contractState.isRegistered ? "Yes" : "No"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Executed</p>
                    <p className={`text-lg font-bold ${contractState.isExecuted ? "text-green-500" : "text-muted-foreground"}`}>
                      {contractState.isExecuted ? "Yes" : "No"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Countdown Progress Bar */}
              {countdown !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Auto-execute countdown</span>
                    <span>{countdown}s</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-1000"
                      style={{ width: `${(countdown / AUTO_EXECUTE_DELAY) * 100}%` }}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={cancelAutoExecute} className="w-full">
                    Cancel Auto-Execute
                  </Button>
                </div>
              )}

              <div className="flex justify-center gap-4 mt-6">
                {!contractState.isRegistered && (
                  <Button
                    onClick={() => setModalOpen(true)}
                    className="gap-2"
                    disabled={!isConnected || loading || !parentAddr}
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Register</span>
                  </Button>
                )}
                {contractState.isRegistered && !contractState.isExecuted && (
                  <Button
                    onClick={handleExecute}
                    variant="destructive"
                    className="gap-2"
                    disabled={loading || !isConnected}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span>{loading ? "Executing..." : "Execute Now"}</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Register Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Inheritance</DialogTitle>
            <DialogDescription>
              Your wallet is the parent. Enter the child wallet address. Auto-executes {AUTO_EXECUTE_DELAY}s after registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Parent Wallet (You)</Label>
              <div className="p-2 bg-muted rounded-md">
                <p className="text-sm font-mono text-muted-foreground">
                  {parentAddr ? truncateAddr(parentAddr) : "Wallet not connected"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="child">Child Wallet Address (hex)</Label>
              <Input
                id="child"
                placeholder="64 character hex string"
                value={childAddr}
                onChange={(e) => setChildAddr(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRegister}
              disabled={!parentAddr || !childAddr || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
