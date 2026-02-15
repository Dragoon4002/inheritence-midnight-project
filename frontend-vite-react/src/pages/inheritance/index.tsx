import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useState } from "react";

const CONTRACT_ADDRESS = import.meta.env.VITE_INHERITANCE_CONTRACT_ADDRESS;

type ContractState = {
  isRegistered: boolean;
  isExecuted: boolean;
  parent: string;
  child: string;
};

export const Inheritance = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [parentAddr, setParentAddr] = useState("");
  const [childAddr, setChildAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractState, setContractState] = useState<ContractState>({
    isRegistered: false,
    isExecuted: false,
    parent: "",
    child: "",
  });

  const handleRegister = async () => {
    if (!parentAddr || !childAddr) return;
    setLoading(true);
    // TODO: call contract register circuit
    // For now, simulate registration
    setTimeout(() => {
      setContractState({
        isRegistered: true,
        isExecuted: false,
        parent: parentAddr,
        child: childAddr,
      });
      setLoading(false);
      setModalOpen(false);
    }, 1000);
  };

  const handleExecute = async () => {
    if (!contractState.isRegistered || contractState.isExecuted) return;
    setLoading(true);
    // TODO: call contract execute circuit
    setTimeout(() => {
      setContractState(prev => ({ ...prev, isExecuted: true }));
      setLoading(false);
    }, 1000);
  };

  const truncateAddr = (addr: string) =>
    addr ? `${addr.slice(0, 8)}...${addr.slice(-8)}` : "";

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
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Contract Address</p>
            <p className="text-sm font-mono">{truncateAddr(CONTRACT_ADDRESS)}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {contractState.isExecuted ? (
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
                  ? "Ready to execute inheritance"
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

              <div className="flex justify-center gap-4 mt-6">
                {!contractState.isRegistered && (
                  <Button onClick={() => setModalOpen(true)} className="gap-2">
                    <PlusCircle className="w-5 h-5" />
                    <span>Register</span>
                  </Button>
                )}
                {contractState.isRegistered && !contractState.isExecuted && (
                  <Button onClick={handleExecute} variant="destructive" className="gap-2" disabled={loading}>
                    <Send className="w-5 h-5" />
                    <span>{loading ? "Executing..." : "Execute Inheritance"}</span>
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
              Enter parent and child wallet addresses. Parent deposits assets, child receives on execution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Wallet Address</Label>
              <Input
                id="parent"
                placeholder="0x... or mn_addr_..."
                value={parentAddr}
                onChange={(e) => setParentAddr(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child">Child Wallet Address</Label>
              <Input
                id="child"
                placeholder="0x... or mn_addr_..."
                value={childAddr}
                onChange={(e) => setChildAddr(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={!parentAddr || !childAddr || loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
